use log::error;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

use crate::db::{groups, memberships, splits, transactions};
use crate::models::membership::MembershipStatus;
use crate::models::split::Split;
use crate::utils::currency::convert_currency;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct Debt {
    debtor: String,
    creditor: String,
    net_owed: Decimal,
    net_owed_ones: Decimal,
}

#[derive(Clone)]
pub struct NetOwed {
    address: String,
    net_owed: Decimal,
}

#[derive(Debug)]
struct SplitsWithCurrency {
    splits: Vec<Split>,
    currency: String,
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
) -> Result<Json<Vec<Debt>>, StringResponseWithStatus> {
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
    let mut splits_with_currency = vec![];
    for txn in &transactions {
        let splits = match splits::get_splits_by_txn(pool, txn.id.as_str()).await {
            Ok(splits) => SplitsWithCurrency {
                splits,
                currency: txn.currency.clone(),
            },
            Err(e) => {
                error!("error getting splits in db: {}", e);
                return Err(StringResponseWithStatus {
                    status: Status::InternalServerError,
                    message: "failed to get splits in db".to_string(),
                });
            }
        };
        splits_with_currency.push(splits);
    }

    let mut net_owed = HashMap::new();

    // Add txn credits to net_owed
    for txn in &transactions {
        let owed = net_owed
            .entry(txn.paid_by.clone())
            .or_insert(Decimal::new(0, 2));
        let mut final_amount = txn.amount.clone();

        if txn.currency != group.currency {
            final_amount = match convert_currency(
                pool,
                txn.currency.as_str(),
                group.currency.as_str(),
                final_amount,
            )
            .await
            {
                Ok(amount) => amount,
                Err(e) => {
                    error!(
                        "failed to convert currency for transaction {}: {}",
                        txn.id, e
                    );
                    return Err(StringResponseWithStatus {
                        status: Status::InternalServerError,
                        message: "failed to convert currency for transaction".to_string(),
                    });
                }
            };
        }

        *owed += final_amount;
    }

    // Add split debt to net_owed
    for split_with_currency in splits_with_currency {
        for split in split_with_currency.splits {
            let owed = net_owed
                .entry(split.user.clone())
                .or_insert(Decimal::new(0, 2));
            let mut final_share = split.share.clone();

            if split_with_currency.currency != group.currency {
                final_share = match convert_currency(
                    pool,
                    split_with_currency.currency.as_str(),
                    group.currency.as_str(),
                    final_share,
                )
                .await
                {
                    Ok(amount) => amount,
                    Err(e) => {
                        error!("failed to convert currency for split: {}", e);
                        return Err(StringResponseWithStatus {
                            status: Status::InternalServerError,
                            message: "failed to convert currency for split".to_string(),
                        });
                    }
                };
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
        error!("error calculating settle amounts: empty net owed array");
        return Err(StringResponseWithStatus {
            status: Status::BadRequest,
            message: "error when calculating settle amounts".to_string(),
        });
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
            let debtor_amt_ones = match convert_currency(
                pool,
                group.currency.as_str(),
                "ONE",
                debtor_amt.clone().abs(),
            )
            .await
            {
                Ok(amount) => amount,
                Err(e) => {
                    error!("failed to convert currency to ones: {}", e);
                    return Err(StringResponseWithStatus {
                        status: Status::InternalServerError,
                        message: "failed to convert currency to ones".to_string(),
                    });
                }
            };

            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: debtor_amt.abs(),
                net_owed_ones: debtor_amt_ones,
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
            let creditor_amt_ones = match convert_currency(
                pool,
                group.currency.as_str(),
                "ONE",
                creditor_amt.clone().abs(),
            )
            .await
            {
                Ok(amount) => amount,
                Err(e) => {
                    error!("failed to convert currency to ones: {}", e);
                    return Err(StringResponseWithStatus {
                        status: Status::InternalServerError,
                        message: "failed to convert currency to ones".to_string(),
                    });
                }
            };

            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: creditor_amt,
                net_owed_ones: creditor_amt_ones,
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
            let creditor_amt_ones = match convert_currency(
                pool,
                group.currency.as_str(),
                "ONE",
                creditor_amt.clone().abs(),
            )
            .await
            {
                Ok(amount) => amount,
                Err(e) => {
                    error!("failed to convert currency to ones: {}", e);
                    return Err(StringResponseWithStatus {
                        status: Status::InternalServerError,
                        message: "failed to convert currency to ones".to_string(),
                    });
                }
            };

            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: creditor_amt,
                net_owed_ones: creditor_amt_ones,
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

    Ok(Json(ret))
}
