use crate::db::groups;
use crate::db::transactions;
use crate::models::transaction::Transaction;
use crate::utils::responders::StringResponseWithStatus;

use chrono::Utc;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use rust_decimal::Decimal;
use sqlx::MySqlPool;

#[post("/", format = "json", data = "<new_transaction>")]
pub async fn create_transaction(
    new_transaction: Json<Transaction>,
    pool: &State<MySqlPool>,
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
                message: "error while checking if user exists".to_string(),
            }
        }
    }
    
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
            // TODO: Get this from header
            "Random_paid_by",
            new_transaction.name.as_str(),
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
