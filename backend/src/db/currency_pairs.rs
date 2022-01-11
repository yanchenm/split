use anyhow::Result;
use chrono;
use rust_decimal::Decimal;
use sqlx::MySqlPool;

use crate::models::currency_pair::CurrencyPair;

#[derive(Debug)]
struct Currency {
    currency: String,
}

pub async fn add_or_refresh_currency_pair(
    pool: &MySqlPool,
    in_currency: &str,
    out_currency: &str,
    rate: Decimal,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO CurrencyPair (in_currency, out_currency, rate, fetched) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP) 
        ON DUPLICATE KEY 
        UPDATE rate = ?, fetched = CURRENT_TIMESTAMP;",
        in_currency.to_uppercase(),
        out_currency.to_uppercase(),
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
        "SELECT * FROM CurrencyPair WHERE in_currency = ?;",
        currency.to_uppercase()
    )
    .fetch_optional(pool)
    .await?;

    Ok(result.is_some())
}

pub async fn get_usd_to_currency_rate(pool: &MySqlPool, currency: &str) -> Result<Decimal> {
    let result = sqlx::query_as!(
        CurrencyPair,
        "SELECT * FROM CurrencyPair WHERE in_currency = 'USD' AND out_currency = ?;",
        currency.to_uppercase()
    )
    .fetch_one(pool)
    .await?;
    Ok(result.rate)
}

pub async fn get_currency_to_usd_rate(pool: &MySqlPool, currency: &str) -> Result<Decimal> {
    let result = sqlx::query_as!(
        CurrencyPair,
        "SELECT * FROM CurrencyPair WHERE in_currency = ? AND out_currency = 'USD';",
        currency.to_uppercase()
    )
    .fetch_one(pool)
    .await?;
    Ok(result.rate)
}

pub async fn get_supported_currencies(pool: &MySqlPool) -> Result<Vec<String>> {
    let currencies = sqlx::query_as!(
        Currency,
        "SELECT DISTINCT in_currency as currency FROM CurrencyPair ORDER BY in_currency;"
    )
    .fetch_all(pool)
    .await?
    .iter()
    .map(|c| c.currency.clone())
    .collect();

    Ok(currencies)
}
