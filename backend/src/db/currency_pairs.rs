use anyhow::Result;
use chrono;
use sqlx::MySqlPool;

use crate::models::currency_pair::CurrencyPair;

pub async fn add_or_refresh_currency_pair(
    pool: &MySqlPool,
    in_currency: &str,
    out_currency: &str,
    rate: f32,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO CurrencyPair (in_currency, out_currency, rate, fetched) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP) 
        ON DUPLICATE KEY 
        UPDATE rate = ?, fetched = CURRENT_TIMESTAMP;",
        in_currency,
        out_currency,
        rate,
        rate
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_latest_refreshed_time(pool: &MySqlPool) -> Result<chrono::DateTime<chrono::Utc>> {
    let result = sqlx::query_as!(
        CurrencyPair,
        "SELECT * FROM CurrencyPair ORDER BY fetched DESC LIMIT 1;"
    )
    .fetch_optional(pool)
    .await?;

    match result {
        Some(last_refreshed) => Ok(last_refreshed.fetched),
        None => Ok(chrono::Utc::now() - chrono::Duration::hours(25)),
    }
}

pub async fn does_currency_have_rate(pool: &MySqlPool, currency: &str) -> Result<bool> {
    let result = sqlx::query!(
        "SELECT * FROM CurrencyPair WHERE in_currency = ? OR out_currency = ?;",
        currency.to_uppercase(),
        currency.to_uppercase()
    )
    .fetch_optional(pool)
    .await?;

    Ok(result.is_some())
}
