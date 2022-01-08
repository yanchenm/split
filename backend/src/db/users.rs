use anyhow::Result;
use sqlx::MySqlPool;

pub async fn create_new_user(
    pool: &MySqlPool,
    address: &str,
    username: &str,
    email: &str,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO User (address, username, email) VALUES (?, ?, ?);",
        address,
        username,
        email
    )
    .execute(pool)
    .await?;
    Ok(())
}
