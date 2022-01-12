use log::error;
use rocket::futures::future::try_join_all;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

use crate::db::{groups, memberships, splits, transactions};
use crate::models::membership::MembershipStatus;
use crate::utils::currency::get_currency_conversion_rate;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

use std;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Deserialize, Serialize)]
pub struct Debt {
    debtor: String,
    creditor: String,
    net_owed: Decimal,
    net_owed_ones: Decimal,
}

#[derive(Debug, Deserialize, Serialize)]
struct Settlement {
    group_id: String,
    debts: Vec<Debt>,
}

#[derive(Clone)]
pub struct NetOwed {
    address: String,
    net_owed: Decimal,
}

// Requires that owed_vec is not empty
fn get_min_and_max_owed(owed_vec: Vec<NetOwed>) -> (usize, usize) {
    let mut max_amt: Decimal = Decimal::new(i64::MIN, 2);
    let mut max_idx = 0;

    let mut min_amt: Decimal = Decimal::new(i64::MAX, 2);
    let mut min_idx = 0;

    for (idx, owed) in owed_vec.iter().enumerate() {
        if owed.net_owed > max_amt {
            max_amt = owed.net_owed;
            max_idx = idx;
        }
        if owed.net_owed < min_amt {
            min_amt = owed.net_owed;
            min_idx = idx;
        }
    }
    (min_idx, max_idx)
}

#[get("/<group_id>")]
pub async fn get_settlement_by_group<'r>(
    pool: &State<MySqlPool>,
    group_id: &str,
    authed_user: AuthedDBUser<'r>,
) -> Result<Json<Settlement>, StringResponseWithStatus> {
    // Check if user is in the group
    match memberships::get_membership_by_group_and_user(
        pool,
        group_id,
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(MembershipStatus::OWNER | MembershipStatus::ACTIVE)) => (),
        Ok(_) => {
            return Err(StringResponseWithStatus {
                status: Status::BadRequest,
                message: "authed user is not a member of the group".to_string(),
            });
        }
        Err(e) => {
            error!("error getting membership in db: {}", e);
            return Err(StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to get membership in db".to_string(),
            });
        }
    }

    // Get group object (for currency)
    let group = match groups::get_group_by_id(pool, group_id).await {
        Ok(Some(group)) => group,
        Ok(None) => {
            return Err(StringResponseWithStatus {
                status: Status::BadRequest,
                message: "group does not exist".to_string(),
            });
        }
        Err(e) => {
            error!("error getting group in db: {}", e);
            return Err(StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to get group in db".to_string(),
            });
        }
    };

    // Cache group currency to ONE by default
    let (one_rate, _) =
        match get_currency_conversion_rate(pool, group.currency.clone(), "ONE".to_string()).await {
            Ok(rate) => rate,
            Err(e) => {
                error!("error getting ONE conversion rate: {}", e);
                return Err(StringResponseWithStatus {
                    status: Status::InternalServerError,
                    message: "failed to get ONE conversion rate".to_string(),
                });
            }
        };

    // Get Transactions for group
    let transactions = match transactions::get_transactions_by_group(pool, group_id).await {
        Ok(txns) => txns,
        Err(_) => {
            return {
                Err(StringResponseWithStatus {
                    status: Status::BadRequest,
                    message: "Failed to get transactions for group due to error".to_string(),
                })
            };
        }
    };

    // Get splits for each transaction
    let split_reqs = transactions.iter().map(|transaction| {
        splits::get_splits_with_currency_by_txn(
            pool,
            transaction.id.as_str(),
            transaction.currency.as_str(),
        )
    });

    let all_splits = match try_join_all(split_reqs).await {
        Ok(splits) => splits,
        Err(_) => {
            return Err(StringResponseWithStatus {
                status: Status::BadRequest,
                message: "Failed to get transactions for group due to error".to_string(),
            })
        }
    };

    // Get distinct currencies to convert from
    let distinct_currencies_reqs = transactions
        .iter()
        .filter(|txn| txn.currency != group.currency)
        .map(|txn| txn.currency.clone())
        .collect::<HashSet<String>>()
        .into_iter()
        .map(|currency| get_currency_conversion_rate(pool, currency, group.currency.clone()));

    let currency_pairs = match try_join_all(distinct_currencies_reqs).await {
        Ok(currency_pair) => currency_pair,
        Err(_) => {
            return Err(StringResponseWithStatus {
                status: Status::BadRequest,
                message: "failed to get currency conversion".to_string(),
            })
        }
    };

    // Cache currency conversion rates
    let mut conversion_rates = HashMap::new();
    for (rate, currency) in currency_pairs {
        conversion_rates.insert(currency, rate);
    }

    let mut net_owed = HashMap::new();

    // Add txn credits to net_owed
    for txn in transactions {
        let owed = net_owed
            .entry(txn.paid_by.clone())
            .or_insert(Decimal::new(0, 2));
        let mut final_amount = txn.amount.clone();

        if txn.currency != group.currency {
            let conversion_rate = match conversion_rates.get(&txn.currency) {
                Some(rate) => rate,
                None => {
                    return Err(StringResponseWithStatus {
                        status: Status::BadRequest,
                        message: "currency conversion rate not found".to_string(),
                    });
                }
            };
            final_amount *= conversion_rate;
        }

        *owed += final_amount;
    }

    // Add split debt to net_owed
    for splits in all_splits {
        for split_with_currency in splits {
            let owed = net_owed
                .entry(split_with_currency.split.user.clone())
                .or_insert(Decimal::new(0, 2));
            let mut final_share = split_with_currency.split.share.clone();

            if split_with_currency.currency != group.currency {
                let conversion_rate = match conversion_rates.get(&split_with_currency.currency) {
                    Some(rate) => rate,
                    None => {
                        return Err(StringResponseWithStatus {
                            status: Status::BadRequest,
                            message: "currency conversion rate not found".to_string(),
                        });
                    }
                };
                final_share *= conversion_rate;
            }

            *owed -= final_share;
        }
    }

    let mut owed_amts: Vec<NetOwed> = net_owed
        .iter()
        .map(|(k, v)| NetOwed {
            address: k.to_string(),
            net_owed: *v,
        })
        .collect();
    let mut ret = vec![];

    if owed_amts.len() < 1 {
        return Ok(Json(Settlement {
            group_id: group_id.to_string(),
            debts: vec![],
        }));
    }

    let zero = Decimal::ZERO;

    loop {
        let min_max = get_min_and_max_owed(owed_amts.clone());
        let debtor = match owed_amts.get(min_max.0) {
            Some(v) => v.clone(),
            None => {
                return Err(StringResponseWithStatus {
                    status: Status::BadRequest,
                    message: "Missing index while calculating settle amounts".to_string(),
                });
            }
        };
        let creditor = match owed_amts.get(min_max.1) {
            Some(v) => v.clone(),
            None => {
                return Err(StringResponseWithStatus {
                    status: Status::BadRequest,
                    message: "Missing index while calculating settle amounts".to_string(),
                });
            }
        };

        let debtor_amt = debtor.net_owed;
        let creditor_amt = creditor.net_owed;
        // If we are getting zero for creditor or debtor amounts, we are done!
        if debtor_amt == zero || creditor_amt == zero {
            break;
        }
        // This should never happen
        if debtor_amt > zero && creditor_amt < zero {
            return Err(StringResponseWithStatus {
                status: Status::BadRequest,
                message: "Fatal error while calculating settlement paths for transactions"
                    .to_string(),
            });
        }

        // Case 0: Creditor is owed more than debtor owes
        if debtor_amt.abs() < creditor_amt.abs() {
            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: debtor_amt.abs(),
                net_owed_ones: debtor_amt.abs() * one_rate,
            });
            owed_amts[min_max.0] = NetOwed {
                address: debtor.address.clone(),
                net_owed: zero,
            };
            owed_amts[min_max.1] = NetOwed {
                address: creditor.address.clone(),
                net_owed: creditor_amt - debtor_amt.abs(),
            };
            continue;
        }
        // Case 1: Creditor is owed less than debtor owes
        else if debtor_amt.abs() > creditor_amt.abs() {
            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: creditor_amt,
                net_owed_ones: creditor_amt * one_rate,
            });
            owed_amts[min_max.0] = NetOwed {
                address: debtor.address.clone(),
                net_owed: debtor_amt + creditor_amt,
            };
            owed_amts[min_max.1] = NetOwed {
                address: creditor.address.clone(),
                net_owed: zero,
            };
            continue;
        }
        // Case 2: Creditor is owed exactly what debtor owes
        else {
            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: creditor_amt,
                net_owed_ones: creditor_amt * one_rate,
            });
            owed_amts[min_max.0] = NetOwed {
                address: debtor.address.clone(),
                net_owed: zero,
            };
            owed_amts[min_max.1] = NetOwed {
                address: creditor.address.clone(),
                net_owed: zero,
            };
            continue;
        }
    }

    Ok(Json(Settlement {
        group_id: group_id.to_string(),
        debts: ret,
    }))
}
