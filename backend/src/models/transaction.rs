use chrono::NaiveDate;
use rust_decimal::Decimal;

use crate::models::split::Split;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DbTransaction {
    pub id: String,
    pub group: String,
    pub base_amount: Decimal,
    pub amount: Decimal,
    pub currency: String,
    pub paid_by: String,
    pub name: String,
    pub date: NaiveDate,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

pub struct DbTransactionWithSplits {
    pub id: String,
    pub group: String,
    pub base_amount: Decimal,
    pub amount: Decimal,
    pub currency: String,
    pub paid_by: String,
    pub name: String,
    pub date: NaiveDate,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub tx_id: String,
    pub user: String,
    pub base_share: Decimal,
    pub share: Decimal,
    pub resolved: i8,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TransactionWithSplits {
    pub transaction: DbTransaction,
    pub splits: Vec<Split>,
}
