use anyhow::Result;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::models::group::Group;

pub async fn create_new_group(
    pool: &MySqlPool,
    name: &str,
    description: Option<&str>,
) -> Result<String> {
    // Generate new uuid for group
    let id = Uuid::new_v4();
    let id_str = id
        .to_simple()
        .encode_lower(&mut Uuid::encode_buffer())
        .to_string();

    sqlx::query!(
        "INSERT INTO `Group` (id, name, description) VALUES (?, ?, ?);",
        id_str,
        name,
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
