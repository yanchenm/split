use anyhow::Result;
use sqlx::MySqlPool;

pub async fn add_new_currency_pair(
    pool: &MySqlPool,
    in_currency: &str,
    out_currency: &str,
    rate: f32,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO CurrencyPair (in_currency, out_currency, rate) VALUES (?, ?, ?);",
        in_currency,
        out_currency,
        rate
    )
    .execute(pool)
    .await?;
    Ok(())
}
