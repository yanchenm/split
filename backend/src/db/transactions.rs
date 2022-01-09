use anyhow::Result;
use chrono::NaiveDate;
use rust_decimal::Decimal;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::models::transaction::Transaction;

pub async fn create_new_transaction(
    pool: &MySqlPool,
    group: &str,
    amount: &Decimal,
    currency: &str,
    paid_by: &str,
    name: &str,
    date: &NaiveDate,
) -> Result<()> {
    // Generate new uuid for transaction
    let id = Uuid::new_v4();
    let id_str = id
        .to_simple()
        .encode_lower(&mut Uuid::encode_buffer())
        .to_string();

    sqlx::query!(
        "INSERT INTO Transaction (id, `group`, amount, currency, paid_by, name, date) VALUES (?, ?, ?, ?, ?, ?, ?);",
        id_str,
        group,
        amount,
        currency,
        paid_by,
        name,
        date
    )
    .execute(pool)
    .await?;
    Ok(())
}
