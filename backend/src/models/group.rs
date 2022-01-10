use chrono;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Group {
    pub id: String,
    pub name: String,
    pub currency: String,
    pub description: Option<String>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}
