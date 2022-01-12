use crate::db::currency_pairs::does_currency_have_rate;
use crate::db::groups;
use crate::db::memberships;
use crate::db::transactions;
use crate::models::membership::MembershipStatus;
use crate::models::transaction::{DbTransaction, TransactionWithSplits};
use crate::utils::transaction_helpers::string_to_decimal;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

use anyhow::{anyhow, Error};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use rust_decimal::Decimal;
use sqlx::MySqlPool;
use std::collections::HashSet;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Transaction {
    pub name: String,
    pub group: String,
    pub total: String,
    pub currency: String,
    pub image: Option<String>,
    pub splits: Vec<Split>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Split {
    pub address: String,
    pub share: String,
}

static DECIMAL_SIZE: usize = 18;

#[post("/", format = "json", data = "<new_transaction>")]
pub async fn create_transaction<'r>(
    new_transaction: Json<Transaction>,
    pool: &State<MySqlPool>,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    match validate_splits(&new_transaction.splits) {
        Ok(_) => (),
        Err(e) => {
            error!("splits are invalid: {}", e);
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "transaction request invalid".to_string(),
            };
        }
    }

    match validate_total(&new_transaction.total, &new_transaction.splits) {
        Ok(_) => (),
        Err(e) => {
            error!("total is invalid {}", e);
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "transaction request invalid".to_string(),
            };
        }
    }

    // Check if the group exists
    match groups::get_group_by_id(pool, new_transaction.group.as_str()).await {
        Ok(Some(_)) => (),
        Ok(None) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "group does not exist".to_string(),
            }
        }
        Err(e) => {
            error!("error checking group exists: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking if group exists".to_string(),
            };
        }
    }

    // Check if person is in the group
    match memberships::get_membership_by_group_and_user(
        pool,
        new_transaction.group.as_str(),
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(MembershipStatus::ACTIVE | MembershipStatus::OWNER)) => (),
        Ok(Some(_) | None) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "user is not in group".to_string(),
            }
        }
        Err(e) => {
            error!("error checking membership: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking if user is in group".to_string(),
            };
        }
    };

    // Check if currency is supported
    match does_currency_have_rate(pool, new_transaction.currency.as_str()).await {
        Ok(false) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: format!("{} is not a supported currency", new_transaction.currency),
            }
        }
        Ok(true) => (),
        Err(e) => {
            error!("error checking if currency has rate: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to check if currency is supported".to_string(),
            };
        }
    }

    // TODO: Validate splits add up to 1

    // Create transaction and splits atomically
    match transactions::batch_create_transaction_splits(
        pool,
        new_transaction,
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(()) => {
            return StringResponseWithStatus {
                status: Status::Created,
                message: "transaction and splits created".to_string(),
            }
        }
        Err(e) => {
            error!("error creating transaction in db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while inserting transaction".to_string(),
            };
        }
    };
}

#[put("/<tx_id>", format = "json", data = "<updated_transaction>")]
pub async fn update_transaction<'r>(
    pool: &State<MySqlPool>,
    tx_id: &str,
    updated_transaction: Json<Transaction>,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    // Check if the group exists
    match groups::get_group_by_id(pool, updated_transaction.group.as_str()).await {
        Ok(Some(_)) => (),
        Ok(None) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "group does not exist".to_string(),
            }
        }
        Err(e) => {
            error!("error checking group exists: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking if group exists".to_string(),
            };
        }
    }

    // Check if person is in the group
    match memberships::get_membership_by_group_and_user(
        pool,
        updated_transaction.group.as_str(),
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(_)) => (),
        Ok(None) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "user is not in group".to_string(),
            }
        }
        Err(e) => {
            error!("error checking membership: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking if user is in group".to_string(),
            };
        }
    };

    // Check if currency is supported
    match does_currency_have_rate(pool, updated_transaction.currency.as_str()).await {
        Ok(false) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: format!(
                    "{} is not a supported currency",
                    updated_transaction.currency
                ),
            }
        }
        Ok(true) => (),
        Err(e) => {
            error!("error checking if currency has rate: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to check if currency is supported".to_string(),
            };
        }
    }

    // TODO: Validate splits add up to 1

    // Create transaction and splits atomically
    match transactions::batch_update_transaction_splits(pool, updated_transaction, tx_id).await {
        Ok(()) => {
            return StringResponseWithStatus {
                status: Status::Accepted,
                message: "transaction and splits updated".to_string(),
            }
        }
        Err(e) => {
            error!("error creating transaction in db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while inserting transaction".to_string(),
            };
        }
    };
}

#[delete("/<tx_id>")]
pub async fn delete_transaction<'r>(
    pool: &State<MySqlPool>,
    tx_id: &str,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    // Check if transaction belongs to user
    match transactions::get_transaction_by_id_and_paid_by(pool, tx_id, authed_user.address.as_str())
        .await
    {
        Ok(Some(_)) => (),
        Ok(None) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "transaction does not belong to user".to_string(),
            }
        }
        Err(e) => {
            error!("error checking membership: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking transaction ownership".to_string(),
            };
        }
    };

    match transactions::delete_transaction(pool, tx_id).await {
        Ok(()) => {
            return StringResponseWithStatus {
                status: Status::Accepted,
                message: "transaction and splits deleted".to_string(),
            }
        }
        Err(e) => {
            error!("error deleting transaction in db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error deleting transaction".to_string(),
            };
        }
    };
}

#[get("/group/<group_id>")]
pub async fn get_transactions_by_group<'r>(
    pool: &State<MySqlPool>,
    group_id: &str,
    authed_user: AuthedDBUser<'r>,
) -> Result<Json<Vec<DbTransaction>>, StringResponseWithStatus> {
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

    match transactions::get_transactions_by_group(pool, group_id).await {
        Ok(txns) => Ok(Json(txns)),
        Err(_) => Err(StringResponseWithStatus {
            status: Status::BadRequest,
            message: "Failed to get transactions for group due to error".to_string(),
        }),
    }
}

#[get("/withsplits/group/<group_id>")]
pub async fn get_transactions_by_group_with_splits<'r>(
    pool: &State<MySqlPool>,
    group_id: &str,
    authed_user: AuthedDBUser<'r>,
) -> Result<Json<Vec<TransactionWithSplits>>, StringResponseWithStatus> {
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

    match transactions::get_transactions_by_group_with_splits(pool, group_id).await {
        Ok(txns) => Ok(Json(txns)),
        Err(_) => Err(StringResponseWithStatus {
            status: Status::BadRequest,
            message: "Failed to get transactions for group due to error".to_string(),
        }),
    }
}

fn validate_string_is_valid_decimal<'v>(maybe_decimal: &str) -> Result<(), Error> {
    for c in maybe_decimal.chars() {
        if !c.is_numeric() && c != '.' {
            Err(anyhow!("invalid decimal string"))?;
        }
    }

    let whole_number_len = maybe_decimal
        .find('.')
        .unwrap_or_else(|| maybe_decimal.chars().count());
    if whole_number_len > DECIMAL_SIZE {
        Err(anyhow!("invalid decimal string"))?;
    }
    Ok(())
}

fn validate_splits<'v>(_splits: &Vec<Split>) -> Result<(), Error> {
    let mut split_addresses_set = HashSet::new();
    for split in _splits {
        match validate_string_is_valid_decimal(split.share.as_str()) {
            Ok(_) => (),
            Err(e) => return Err(e),
        };
        if split_addresses_set.contains(&split.address.as_str()) {
            Err(anyhow!("duplicated split address"))?
        }
        split_addresses_set.insert(split.address.as_str());
    }

    Ok(())
}

fn validate_total<'v>(total: &str, _splits: &Vec<Split>) -> Result<(), Error> {
    match validate_string_is_valid_decimal(total) {
        Ok(_) => (),
        Err(e) => return Err(e),
    }
    fn sum_split_shares(splits: &[Split]) -> Decimal {
        let decimal_vec = splits.iter().map(|s| string_to_decimal(&s.share.as_str()));
        let mut sum: Decimal = Decimal::new(0, 2);
        for decimal in decimal_vec {
            sum = sum + decimal;
        }

        return sum;
    }
    if sum_split_shares(_splits) != string_to_decimal(total) {
        Err(anyhow!("total is not equal to split share sum"))?
    }

    Ok(())
}
