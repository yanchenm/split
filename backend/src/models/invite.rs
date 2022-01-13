use chrono;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Invite {
    pub group_id: String,
    pub invite_code: String,
    pub isActive: i8,
    pub created_by: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}
