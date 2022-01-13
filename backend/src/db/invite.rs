use anyhow::Result;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::models::invite::Invite;

pub async fn create_new_invite(pool: &MySqlPool, group_id: &str, address: &str) -> Result<String> {
    // Generate new uuid for invite
    let id = Uuid::new_v4();
    let code = id
        .to_simple()
        .encode_lower(&mut Uuid::encode_buffer())
        .to_string();

    sqlx::query!(
        "INSERT INTO `Invite` (group_id, invite_code, isActive, created_by) VALUES (?, ?, ?, ?);",
        group_id,
        code,
        1,
        address
    )
    .execute(pool)
    .await?;
    Ok(code)
}

pub async fn get_invite_by_code(pool: &MySqlPool, invite_code: &str) -> Result<Option<Invite>> {
    let invite = sqlx::query_as!(
        Invite,
        "SELECT * FROM `Invite` WHERE invite_code = ?;",
        invite_code
    )
    .fetch_optional(pool)
    .await?;
    Ok(invite)
}
