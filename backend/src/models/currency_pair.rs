use serde::{Deserialize, Serialize};
use sqlx::types::chrono::NaiveDateTime;

#[derive(Debug, Deserialize, Serialize)]
pub struct CurrencyPair {
    pub in_currency: String,
    pub out_currency: String,
    pub rate: f32,
    pub fetched: NaiveDateTime,
}
