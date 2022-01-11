use log::error;
use rocket::{http::Status, serde::json::Json, State};
use sqlx::MySqlPool;

use crate::{
    db,
    db::currency_pairs::get_latest_refreshed_time,
    utils::{
        currency::{refresh_currency_pairs_from_api, refresh_harmony_price_from_api},
        responders::StringResponseWithStatus,
    },
};

#[post("/refresh")]
pub async fn refresh_currency_conversions(pool: &State<MySqlPool>) -> StringResponseWithStatus {
    // Don't refresh if latest refresh is less than 55 minutes old
    match get_latest_refreshed_time(pool).await {
        Ok(latest_refreshed_time) => {
            let now = chrono::Utc::now();
            if now.signed_duration_since(latest_refreshed_time) < chrono::Duration::minutes(55) {
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

#[post("/refresh_harmony")]
pub async fn refresh_harmony_price(pool: &State<MySqlPool>) -> StringResponseWithStatus {
    // Don't refresh if latest price is less than 4 minutes old
    match get_latest_refreshed_time(pool).await {
        Ok(latest_refreshed_time) => {
            let now = chrono::Utc::now();
            if now.signed_duration_since(latest_refreshed_time) < chrono::Duration::minutes(4) {
                return StringResponseWithStatus {
                    status: Status::Ok,
                    message: "harmony price is up to date".to_string(),
                };
            }
        }
        Err(e) => {
            error!("Failed to get latest harmony price: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to get latest harmony price".to_string(),
            };
        }
    };

    match refresh_harmony_price_from_api(pool).await {
        Ok(_) => StringResponseWithStatus {
            status: Status::Ok,
            message: "success".to_string(),
        },
        Err(e) => {
            error!("Failed to refresh harmony price: {}", e);
            StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to refresh harmony price".to_string(),
            }
        }
    }
}

#[get("/supported")]
pub async fn get_supported_currencies(
    pool: &State<MySqlPool>,
) -> Result<Json<Vec<String>>, StringResponseWithStatus> {
    match db::currency_pairs::get_supported_currencies(pool).await {
        Ok(currencies) => Ok(Json(currencies)),
        Err(e) => {
            error!("failed to get supported currencies: {}", e);
            return Err(StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to get supported currencies".to_string(),
            });
        }
    }
}
