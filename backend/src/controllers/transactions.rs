use crate::db::groups;
use crate::db::transactions;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

use chrono::Utc;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use rust_decimal::Decimal;
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
        Ok(None) => (
            return StringResponseWithStatus {
            status: Status::PreconditionFailed,
            message: "group does not exist".to_string(),
        }),
        Err(_) => {
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking if group exists".to_string(),
            }
        }
    }

    // Check if person is in the group
    // match memberships::get_membership_by_group_and_user(
    //     pool,
    //     group_id.as_str(),
    //     authed_user.address.as_str(),
    // )
    // .await
    // {
    //     Ok(Some(_)) => (),
    //     Ok(None) => {
    //         return StringResponseWithStatus {
    //             status: Status::PreconditionFailed,
    //             message: "user is not in group".to_string(),
    //         }
    //     },
    //     Err(_) => {
    //         return StringResponseWithStatus {
    //             status: Status::InternalServerError,
    //             message: "error while checking if user is in group".to_string(),
    //         }
    //     }
    // };
    
    let current_date = Utc::now().date().naive_utc();
    let total_amount = string_to_decimal(new_transaction.total.as_str());
    

    // TODO: Make this transaction idempotent and atomic
    for split in new_transaction.splits.iter() {
        let amount = total_amount * string_to_decimal(&split.share);

        match transactions::create_new_transaction(
            pool,
            new_transaction.group.as_str(),
            &amount,
            new_transaction.currency.as_str(),
            authed_user.address.as_str(),
            new_transaction.name.to_lowercase().as_str(),
            &current_date
        )
        .await
        {
            Ok(_) => (),
            Err(_) => {
                return StringResponseWithStatus {
                    status: Status::InternalServerError,
                    message: "error adding transaction".to_string(),
                }
            }
        };
    }

    return StringResponseWithStatus {
        status: Status::Created,
        message: "transaction created".to_string(),
    }
}

fn get_scale(number_string: &str) -> usize {
    let maybe_period_index = number_string.find('.');

    match maybe_period_index {
        Some(period_index) => number_string.chars().count() - period_index - 1,
        None => 0,
    }
}

fn string_to_decimal(number_string: &str) -> rust_decimal::Decimal {
    let scale = get_scale(number_string) as u32;
    let number : i64 = str::replace(number_string, ".", "").parse().unwrap();

    return Decimal::new(number, scale);
}
