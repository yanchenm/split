use rust_decimal::Decimal;
use chrono::{NaiveDate, NaiveTime};

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Transaction {
    pub id: String,
    pub group: String,
    pub amount: String,
    pub currency: String,
    pub paid_by: Option<String>,
    pub name: Vec<Split>,
    pub date: NaiveDate,
    pub updated_at: NaiveTime
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Split {
    pub tx_id: String,
    pub user: String,
    pub share: Decimal
}
