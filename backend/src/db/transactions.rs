use anyhow::Result;
use chrono::NaiveDate;
use chrono::Utc;
use rocket::serde::json::Json;
use rust_decimal::Decimal;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::controllers::transactions::Transaction;
use crate::models::transaction::DbTransaction;
use crate::utils::transaction_helpers::string_to_decimal;

// Transaction queries
pub async fn create_new_transaction(
    pool: &MySqlPool,
    id: &str,
    group: &str,
    amount: &Decimal,
    currency: &str,
    paid_by: &str,
    name: &str,
    date: &NaiveDate,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO Transaction (id, `group`, amount, currency, paid_by, name, date) VALUES (?, ?, ?, ?, ?, ?, ?);",
        id,
        group,
        amount,
        currency.to_uppercase(),
        paid_by.to_lowercase(),
        name,
        date
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn update_transaction(
    pool: &MySqlPool,
    id: &str,
    amount: &Decimal,
    currency: &str,
    name: &str,
) -> Result<()> {
    sqlx::query!(
        "UPDATE Transaction SET amount = ?, currency = ?, name = ? WHERE id = ?;",
        amount,
        currency.to_uppercase(),
        name,
        id
    )
    .execute(pool)
    .await?;
    Ok(())
}

// Split queries
pub async fn create_new_split(
    pool: &MySqlPool,
    tx_id: &str,
    user: &str,
    share: &Decimal,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO Split (tx_id, user, share) VALUES (?, ?, ?);",
        tx_id,
        user.to_lowercase(),
        share,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn delete_tx_splits(pool: &MySqlPool, tx_id: &str) -> Result<()> {
    sqlx::query!("DELETE FROM Split WHERE tx_id = ?;", tx_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn batch_update_transaction_splits(
    pool: &MySqlPool,
    updated_transaction: Json<Transaction>,
    tx_id: &str, // user_address: &str
) -> Result<()> {
    // let current_date = Utc::now().date().naive_utc();
    let total_amount = string_to_decimal(updated_transaction.total.as_str());
    let tx = pool.begin().await?;

    update_transaction(
        pool,
        tx_id,
        &total_amount,
        updated_transaction.currency.as_str(),
        updated_transaction.name.as_str(),
    )
    .await?;

    delete_tx_splits(pool, tx_id).await?;

    for split in updated_transaction.splits.iter() {
        let share_str = string_to_decimal(split.share.as_str());
        create_new_split(pool, tx_id, split.address.as_str(), &share_str).await?;
    }

    tx.commit().await?;
    Ok(())
}

pub async fn batch_create_transaction_splits(
    pool: &MySqlPool,
    new_transaction: Json<Transaction>,
    user_address: &str,
) -> Result<()> {
    let current_date = Utc::now().date().naive_utc();
    let total_amount = string_to_decimal(new_transaction.total.as_str());

    let id = Uuid::new_v4();
    let tx_id_str = id
        .to_simple()
        .encode_lower(&mut Uuid::encode_buffer())
        .to_string();

    let tx = pool.begin().await?;
    create_new_transaction(
        pool,
        tx_id_str.as_str(),
        new_transaction.group.as_str(),
        &total_amount,
        new_transaction.currency.as_str(),
        user_address,
        new_transaction.name.as_str(),
        &current_date,
    )
    .await?;

    for split in new_transaction.splits.iter() {
        let share_str = string_to_decimal(split.share.as_str());
        create_new_split(pool, tx_id_str.as_str(), split.address.as_str(), &share_str).await?;
    }

    tx.commit().await?;
    Ok(())
}

pub async fn get_transactions_by_group(
    pool: &MySqlPool,
    group_id: &str,
) -> Result<Vec<DbTransaction>> {
    let transactions = sqlx::query_as!(
        DbTransaction,
        "SELECT * FROM Transaction t
        WHERE t.group = ?;",
        group_id
    )
    .fetch_all(pool)
    .await?;
    Ok(transactions)
}
