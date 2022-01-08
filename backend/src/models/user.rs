use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct User {
    pub address: String,
    pub username: String,
    pub email: String,
}
