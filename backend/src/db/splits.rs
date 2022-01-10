use anyhow::Result;
use sqlx::MySqlPool;

use crate::models::split::Split;

pub async fn get_splits_by_txn(pool: &MySqlPool, tx_id: &str) -> Result<Vec<Split>> {
    let splits = sqlx::query_as!(
        Split,
        "SELECT * FROM Split s
        WHERE s.tx_id = ?;",
        tx_id,
    )
    .fetch_all(pool)
    .await?;
    Ok(splits)
}
