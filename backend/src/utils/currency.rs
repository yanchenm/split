use std::{collections::HashMap, env};

use anyhow::{anyhow, Result};
use rocket::futures::future::join_all;
use serde::{Deserialize, Serialize};
use sqlx::MySqlPool;
use tokio::task;

use crate::db::currency_pairs::add_new_currency_pair;

#[derive(Debug, Deserialize, Serialize)]
pub struct CurrencyAPIResponse {
    pub data: HashMap<String, f32>,
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
            add_new_currency_pair(&pool_clone, "USD", currency.as_str(), rate)
                .await
                .expect(format!("Failed to add currency pair {} - {}", "USD", currency).as_str());
            add_new_currency_pair(&pool_clone, currency.as_str(), "USD", 1.0 / rate)
                .await
                .expect(format!("Failed to add currency pair {} - {}", currency, "USD").as_str());
        }));
    }
    join_all(handles).await;
    Ok(())
}
