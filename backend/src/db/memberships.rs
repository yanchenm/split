use anyhow::Result;
use sqlx::MySqlPool;

use crate::models::membership::MembershipStatus;

pub async fn create_new_membership(
    pool: &MySqlPool,
    user: &str,
    group: &str,
    status: MembershipStatus,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO Membership (`group`, user, status) VALUES(?, ?, ?);",
        group,
        user,
        status.to_string()
    )
    .execute(pool)
    .await?;
    Ok(())
}
