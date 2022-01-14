use anyhow::Result;
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};

pub mod currency_pairs;
pub mod groups;
pub mod invite;
pub mod memberships;
pub mod transactions;
pub mod users;

const MAX_POOL_SIZE: u32 = 30;

pub async fn initialize(
    host: &str,
    port: u16,
    name: &str,
    user: &str,
    password: &str,
) -> Result<MySqlPool> {
    let connection_string = format!("mysql://{}:{}@{}:{}/{}", user, password, host, port, name);
    let pool = MySqlPoolOptions::new()
        .max_connections(MAX_POOL_SIZE)
        .connect(&connection_string)
        .await?;
    Ok(pool)
}
