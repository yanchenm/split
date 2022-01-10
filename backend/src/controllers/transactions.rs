use crate::db::currency_pairs::does_currency_have_rate;
use crate::db::groups;
use crate::db::memberships;
use crate::db::transactions;
use crate::models::membership::MembershipStatus;
use crate::models::transaction::DbTransaction;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

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

#[post("/", format = "json", data = "<new_transaction>")]
pub async fn create_transaction<'r>(
    new_transaction: Json<Transaction>,
    pool: &State<MySqlPool>,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
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
    let currency = new_transaction.currency.to_uppercase();
    match does_currency_have_rate(pool, &currency).await {
        Ok(false) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: format!("{} is not a supported currency", currency),
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
