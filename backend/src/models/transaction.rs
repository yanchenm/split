use chrono::NaiveDate;
use rust_decimal::Decimal;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct DbTransaction {
    pub id: String,
    pub group: String,
    pub amount: Decimal,
    pub currency: String,
    pub paid_by: String,
    pub name: String,
    pub date: NaiveDate,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}
