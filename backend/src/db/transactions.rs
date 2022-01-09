use anyhow::Result;
use chrono::NaiveDate;
use chrono::Utc;
use rocket::serde::json::Json;
use rust_decimal::Decimal;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::controllers::transactions::Transaction;

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
        currency,
        paid_by,
        name,
        date
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn create_new_split(
    pool: &MySqlPool,
    tx_id: &str,
    user: &str,
    share: &Decimal, 
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO Split (tx_id, user, share) VALUES (?, ?, ?);",
        tx_id,
        user,
        share,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn batch_transaction_splits(
    pool: &MySqlPool,
    new_transaction: Json<Transaction>,
    user_address: &str
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
        new_transaction.name.to_lowercase().as_str(),
        &current_date
    ).await?;


    // TODO: Make this transaction idempotent and atomic
    for split in new_transaction.splits.iter() {
        let share_str = string_to_decimal(split.share.as_str());
        create_new_split(
            pool,
            tx_id_str.as_str(),
            split.address.as_str(),
            &share_str,
        ).await?;
    }

    tx.commit().await?;
    Ok(())
}

fn get_scale(number_string: &str) -> usize {
    let maybe_period_index = number_string.find('.');

    match maybe_period_index {
        Some(period_index) => number_string.chars().count() - period_index - 1,
        None => 0,
    }
}

fn string_to_decimal(number_string: &str) -> rust_decimal::Decimal {
    let scale = get_scale(number_string) as u32;
    let number : i64 = str::replace(number_string, ".", "").parse().unwrap();

    return Decimal::new(number, scale);
}
