use log::error;
use rocket::{http::Status, State};
use sqlx::MySqlPool;

use crate::{
    db::currency_pairs::get_latest_refreshed_time,
    utils::{currency::refresh_currency_pairs_from_api, responders::StringResponseWithStatus},
};

#[post("/refresh")]
pub async fn refresh_currency_conversions(pool: &State<MySqlPool>) -> StringResponseWithStatus {
    // Don't refresh is latest refresh is less than an hour old
    match get_latest_refreshed_time(pool).await {
        Ok(latest_refreshed_time) => {
            let now = chrono::Utc::now();
            if now.signed_duration_since(latest_refreshed_time) < chrono::Duration::hours(1) {
                return StringResponseWithStatus {
                    status: Status::Ok,
                    message: "currency conversions are up to date".to_string(),
                };
            }
        }
        Err(e) => {
            error!("Failed to get latest refreshed time: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to refresh currency conversions".to_string(),
            };
        }
    };

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
