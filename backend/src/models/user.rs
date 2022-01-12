use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct UserDb {
    pub address: String,
    pub username: String,
    pub email: Option<String>,
}
