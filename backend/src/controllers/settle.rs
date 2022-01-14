use log::error;
use rocket::futures::future::try_join_all;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

use crate::db::{groups, memberships, transactions, users};
use crate::models::membership::MembershipStatus;
use crate::utils::currency::get_currency_conversion_rate;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

use std;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Deserialize, Serialize)]
pub struct Debt {
    debtor: String,
    creditor: String,
    creditor_username: String,
    net_owed: Decimal,
    net_owed_ones: Decimal,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Settlement {
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

    let transactions_with_splits =
        match transactions::get_transactions_by_group_with_splits(pool, group_id).await {
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

    let mut net_owed = HashMap::new();

    // Add txn credits to net_owed and splits
    for transaction_with_splits in transactions_with_splits {
        let txn = transaction_with_splits.transaction;
        let splits = transaction_with_splits.splits;

        // Add credit for transaction creator (creditor)
        {
            let txn_owed = net_owed
                .entry(txn.paid_by.clone())
                .or_insert(Decimal::new(0, 2));
            *txn_owed += txn.base_amount;
        }

        // Subtract debts for debtors
        for split in splits {
            let split_owed = net_owed
                .entry(split.user.clone())
                .or_insert(Decimal::new(0, 2));
            *split_owed -= split.base_share;
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

        let creditor_user = match users::get_user_by_address(pool, creditor.address.as_str()).await
        {
            Ok(Some(user)) => user,
            _ => {
                return Err(StringResponseWithStatus {
                    status: Status::BadRequest,
                    message: "Error geting user object for creditor".to_string(),
                })
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
                creditor_username: creditor_user.username,
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
                creditor_username: creditor_user.username,
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
                creditor_username: creditor_user.username,
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
