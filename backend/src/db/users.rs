use anyhow::Result;
use sqlx::MySqlPool;

use crate::models::user::UserDb;

pub async fn create_new_user(
    pool: &MySqlPool,
    address: &str,
    username: &str,
    email: Option<&str>,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO User (address, username, email) VALUES (?, ?, ?);",
        address.to_lowercase(),
        username,
        email
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_user_by_address(pool: &MySqlPool, address: &str) -> Result<Option<UserDb>> {
    let user = sqlx::query_as!(
        UserDb,
        "SELECT * FROM User WHERE address = ?;",
        address.to_lowercase()
    )
    .fetch_optional(pool)
    .await?;
    Ok(user)
}
