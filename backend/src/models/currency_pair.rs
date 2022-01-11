use chrono;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CurrencyPair {
    pub in_currency: String,
    pub out_currency: String,
    pub rate: Decimal,
    pub fetched: chrono::DateTime<chrono::Utc>,
}
