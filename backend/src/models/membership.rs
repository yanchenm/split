use anyhow::{anyhow, Error};
use serde::{Deserialize, Serialize};
use std::{fmt, str};

#[derive(Debug, Deserialize, Serialize)]
pub enum MembershipStatus {
    OWNER,
    ACTIVE,
    INVITED,
    LEFT,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct Membership {
    pub group: String,
    pub user: String,
    pub status: String,
}

impl fmt::Display for MembershipStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MembershipStatus::OWNER => write!(f, "OWNER"),
            MembershipStatus::ACTIVE => write!(f, "ACTIVE"),
            MembershipStatus::INVITED => write!(f, "INVITED"),
            MembershipStatus::LEFT => write!(f, "LEFT"),
        }
    }
}

impl str::FromStr for MembershipStatus {
    type Err = Error;

    fn from_str(input: &str) -> Result<Self, Self::Err> {
        match input.to_uppercase().as_str() {
            "OWNER" => Ok(MembershipStatus::OWNER),
            "ACTIVE" => Ok(MembershipStatus::ACTIVE),
            "INVITED" => Ok(MembershipStatus::INVITED),
            "LEFT" => Ok(MembershipStatus::LEFT),
            _ => Err(anyhow!("invalid membership status")),
        }
    }
}
