use core::fmt;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub enum MembershipStatus {
    ACTIVE,
    INVITED,
    LEFT,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Membership {
    pub group: String,
    pub user: String,
    pub status: MembershipStatus,
}

impl fmt::Display for MembershipStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MembershipStatus::ACTIVE => write!(f, "ACTIVE"),
            MembershipStatus::INVITED => write!(f, "INVITED"),
            MembershipStatus::LEFT => write!(f, "LEFT"),
        }
    }
}
