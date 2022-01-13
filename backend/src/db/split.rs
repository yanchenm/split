use anyhow::Result;
use sqlx::MySqlPool;

pub async fn resolve_splits_for_user(
    pool: &MySqlPool,
    group_id: &str,
    address: &str,
) -> Result<()> {
    sqlx::query!(
        "UPDATE Split s
        JOIN Transaction t ON s.tx_id = t.id AND t.group = ?
        SET s.resolved = '1'
        WHERE s.user = ?;",
        group_id,
        address
    )
    .execute(pool)
    .await?;
    Ok(())
}
