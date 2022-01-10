use anyhow::Result;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::models::group::Group;

pub async fn create_new_group(
    pool: &MySqlPool,
    name: &str,
    currency: &str,
    description: Option<&str>,
) -> Result<String> {
    // Generate new uuid for group
    let id = Uuid::new_v4();
    let id_str = id
        .to_simple()
        .encode_lower(&mut Uuid::encode_buffer())
        .to_string();

    sqlx::query!(
        "INSERT INTO `Group` (id, name, currency, description) VALUES (?, ?, ?, ?);",
        id_str,
        name,
        currency,
        description
    )
    .execute(pool)
    .await?;
    Ok(id_str)
}

pub async fn get_group_by_id(pool: &MySqlPool, group_id: &str) -> Result<Option<Group>> {
    let group = sqlx::query_as!(Group, "SELECT * FROM `Group` WHERE id = ?;", group_id)
        .fetch_optional(pool)
        .await?;

    Ok(group)
}

pub async fn get_groups_by_user(pool: &MySqlPool, address: &str) -> Result<Vec<Group>> {
    let groups = sqlx::query_as!(
        Group,
        "SELECT g.*
        FROM `Group` g
        JOIN Membership
        ON g.id = Membership.group
        AND Membership.user = ?;",
        address
    )
    .fetch_all(pool)
    .await?;
    Ok(groups)
}
