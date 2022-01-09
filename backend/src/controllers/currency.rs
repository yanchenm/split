use log::error;
use rocket::{http::Status, State};
use sqlx::MySqlPool;

use crate::utils::{
    currency::refresh_currency_pairs_from_api, responders::StringResponseWithStatus,
};

#[post("/refresh")]
pub async fn refresh_currency_conversions(pool: &State<MySqlPool>) -> StringResponseWithStatus {
    match refresh_currency_pairs_from_api(pool).await {
        Ok(_) => StringResponseWithStatus {
            status: Status::Ok,
            message: "success".to_string(),
        },
        Err(e) => {
            error!("Failed to refresh currency conversions: {}", e);
            StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to refresh currency conversions".to_string(),
            }
        }
    }
}
