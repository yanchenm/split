use std::str::FromStr;

use anyhow::Result;
use sqlx::MySqlPool;

use crate::models::membership::{Membership, MembershipStatus};

pub async fn create_new_membership(
    pool: &MySqlPool,
    user: &str,
    group: &str,
    status: MembershipStatus,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO Membership (`group`, user, status) VALUES(?, ?, ?);",
        group,
        user.to_lowercase(),
        status.to_string()
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_membership_by_group_and_user(
    pool: &MySqlPool,
    group: &str,
    user: &str,
) -> Result<Option<MembershipStatus>> {
    let membership = sqlx::query_as!(
        Membership,
        "SELECT * FROM Membership WHERE `group` = ? AND user = ?;",
        group,
        user
    )
    .fetch_optional(pool)
    .await?;

    let status = match membership {
        Some(m) => Some(MembershipStatus::from_str(m.status.as_str())?),
        None => None,
    };
    Ok(status)
}
