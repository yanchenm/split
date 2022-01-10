use anyhow::Result;
use sqlx::MySqlPool;

use crate::models::user::User;

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

pub async fn get_user_by_address(pool: &MySqlPool, address: &str) -> Result<Option<User>> {
    let user = sqlx::query_as!(
        User,
        "SELECT * FROM User WHERE address = ?;",
        address.to_lowercase()
    )
    .fetch_optional(pool)
    .await?;
    Ok(user)
}
