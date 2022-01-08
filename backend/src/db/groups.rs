use anyhow::Result;
use sqlx::MySqlPool;
use uuid::Uuid;

pub async fn create_new_group(
    pool: &MySqlPool,
    name: &str,
    description: Option<&str>,
) -> Result<()> {
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
    Ok(())
}
