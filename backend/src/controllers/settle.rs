use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use rocket::futures::future::try_join_all;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

use crate::db::memberships;
use crate::db::{splits, transactions};
use crate::models::membership::MembershipStatus;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct Debt {
    debtor: String,
    creditor: String,
    net_owed: Decimal,
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
) -> Result<Json<Vec<Debt>>, StringResponseWithStatus> {
    // Check if user is in the group
    match memberships::get_membership_by_group_and_user(
        pool,
        group_id,
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(membership)) => match membership {
            MembershipStatus::OWNER | MembershipStatus::ACTIVE => (),
            _ => {
                return Err(StringResponseWithStatus {
                    status: Status::BadRequest,
                    message: "authed user is not a member of the group".to_string(),
                });
            }
        },
        Ok(None) => {
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

    // Get Splits for each transaction
    let split_reqs = transactions
        .iter()
        .map(|transaction| splits::get_splits_by_txn(pool, transaction.id.as_str()));
    let all_splits = match try_join_all(split_reqs).await {
        Ok(splits) => splits,
        Err(_) => {
            return Err(StringResponseWithStatus {
                status: Status::BadRequest,
                message: "Failed to get transactions for group due to error".to_string(),
            })
        }
    };

    let mut net_owed = HashMap::new();
    // TODO: Use currency middleware to turn all txns/splits into base currency (ONE?) before running algo
    // Add txn credits to net_owed
    for txn in transactions {
        let owed = net_owed.entry(txn.paid_by).or_insert(Decimal::new(0, 2));
        *owed += txn.amount;
    }
    // Add split debt to net_owed
    for splits in all_splits {
        for split in splits {
            let owed = net_owed.entry(split.user).or_insert(Decimal::new(0, 2));
            *owed += split.share;
        }
    }

    let mut owed_amts: Vec<NetOwed> = net_owed
        .iter()
        .map(|(k, v)| NetOwed {
            address: k.clone(),
            net_owed: *v,
        })
        .collect();
    let mut ret = vec![];

    if owed_amts.len() < 1 {
        return Err(StringResponseWithStatus {
            status: Status::BadRequest,
            message: "Error when calculating settle amounts: Empty net owed array".to_string(),
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

        let debtor_amt = debtor.net_owed.clone();
        let creditor_amt = creditor.net_owed.clone();
        // If we are getting zero for creditor or debtor amounts, we are done!
        if debtor_amt == zero || creditor_amt == zero {
            break;
        }

        // Case 0: Creditor is owed more than debtor owes
        if debtor_amt.abs() < creditor_amt.abs() {
            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: debtor_amt.abs(),
            });
            owed_amts[min_max.0] = NetOwed {
                address: debtor.address.clone(),
                net_owed: zero,
            };
            owed_amts[min_max.1] = NetOwed {
                address: creditor.address.clone(),
                net_owed: creditor_amt - debtor_amt,
            };
            continue;
        }
        // Case 1: Creditor is owed less than debtor owes
        else if debtor_amt.abs() > creditor_amt.abs() {
            ret.push(Debt {
                debtor: debtor.address.clone(),
                creditor: creditor.address.clone(),
                net_owed: creditor_amt,
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
