use chrono;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CurrencyPair {
    pub in_currency: String,
    pub out_currency: String,
    pub rate: f32,
    pub fetched: chrono::DateTime<chrono::Utc>,
}
