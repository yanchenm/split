use anyhow::Result;
use sqlx::MySqlPool;

use crate::models::split::Split;

#[derive(Debug)]
pub struct SplitWithCurrency {
    pub split: Split,
    pub currency: String,
}

pub async fn get_splits_with_currency_by_txn(
    pool: &MySqlPool,
    tx_id: &str,
    currency: &str,
) -> Result<Vec<SplitWithCurrency>> {
    let splits = sqlx::query_as!(
        Split,
        "SELECT * FROM Split s
        WHERE s.tx_id = ?;",
        tx_id,
    )
    .fetch_all(pool)
    .await?
    .iter()
    .map(|split| SplitWithCurrency {
        split: split.to_owned(),
        currency: currency.to_string(),
    })
    .collect::<Vec<_>>();
    Ok(splits)
}
