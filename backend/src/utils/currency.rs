use std::{collections::HashMap, env};

use anyhow::{anyhow, Result};
use rocket::futures::future::join_all;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};
use sqlx::MySqlPool;
use tokio::task;

use crate::db::currency_pairs::{
    add_or_refresh_currency_pair, get_currency_to_usd_rate, get_usd_to_currency_rate,
};

#[derive(Debug, Deserialize, Serialize)]
struct CurrencyAPIResponse {
    data: HashMap<String, Decimal>,
}

#[derive(Debug, Deserialize)]
struct CMCResponse {
    data: CMCResponseData,
}

#[derive(Debug, Deserialize)]
struct CMCResponseData {
    #[serde(rename = "ONE")]
    harmony_data: HarmonyData,
}

#[derive(Debug, Deserialize)]
struct HarmonyData {
    quote: QuoteData,
}

#[derive(Debug, Deserialize)]
struct QuoteData {
    #[serde(rename = "USD")]
    usd: PriceData,
}

#[derive(Debug, Deserialize)]
struct PriceData {
    price: Decimal,
}

pub async fn refresh_currency_pairs_from_api(pool: &MySqlPool) -> Result<()> {
    let base_url = env::var("CURRENCY_API_URL")?;
    let api_key = env::var("CURRENCY_API_KEY")?;
    let request_url = format!("{}?apikey={}&base_currency=USD", base_url, api_key);
    let response = reqwest::get(&request_url).await?;

    match response.status() {
        reqwest::StatusCode::OK => (),
        status => {
            return Err(anyhow!(
                "failed to get currency pairs from api: status {}",
                status
            ))
        }
    };

    let response_data = response.json::<CurrencyAPIResponse>().await?;
    let mut handles = vec![];
    for (currency, rate) in response_data.data {
        let pool_clone = pool.clone();
        handles.push(task::spawn(async move {
            add_or_refresh_currency_pair(
                &pool_clone,
                "USD",
                currency.to_uppercase().as_str(),
                rate,
            )
            .await
            .expect(format!("Failed to add currency pair {} - {}", "USD", currency).as_str());
            add_or_refresh_currency_pair(
                &pool_clone,
                currency.to_uppercase().as_str(),
                "USD",
                dec!(1.0) / rate,
            )
            .await
            .expect(format!("Failed to add currency pair {} - {}", currency, "USD").as_str());
        }));
    }
    join_all(handles).await;
    Ok(())
}

pub async fn refresh_harmony_price_from_api(pool: &MySqlPool) -> Result<()> {
    let base_url = env::var("CMC_API_URL")?;
    let api_key = env::var("CMC_API_KEY")?;
    let request_url = format!("{}?symbol=ONE&convert=USD", base_url);
    let response = reqwest::Client::new()
        .get(&request_url)
        .header("X-CMC_PRO_API_KEY", api_key)
        .send()
        .await?;

    match response.status() {
        reqwest::StatusCode::OK => (),
        status => {
            return Err(anyhow!(
                "failed to get harmony price from CMC api: status {}",
                status
            ))
        }
    };

    let response_data = response.json::<CMCResponse>().await?;
    add_or_refresh_currency_pair(
        pool,
        "ONE",
        "USD",
        response_data.data.harmony_data.quote.usd.price,
    )
    .await?;
    add_or_refresh_currency_pair(
        pool,
        "USD",
        "ONE",
        dec!(1.0) / response_data.data.harmony_data.quote.usd.price,
    )
    .await?;
    Ok(())
}

pub async fn convert_currency(
    pool: &MySqlPool,
    from: &str,
    to: &str,
    amount: Decimal,
) -> Result<Decimal> {
    let in_to_usd_rate = get_currency_to_usd_rate(pool, from).await?;
    let usd_to_out_rate = get_usd_to_currency_rate(pool, to).await?;
    Ok(amount * in_to_usd_rate * usd_to_out_rate)
}
