pub mod user;

use chrono::prelude::*;
use ethers::abi::ethereum_types::H160;
use ethers::core::types::Signature;
use ethers::utils::hex::ToHex;
use log::error;
use rocket::Request;

use std::str::FromStr;

#[derive(Debug)]
pub enum AuthError {
    Missing,
    Invalid,
    Expired,
    Failed,
    NoUser,
}

enum AuthState {
    Authorized,
    Expired,
    Error,
}

const SIGNATURE_HOURS_TILL_EXPIRY: i64 = 24 * 14;

fn auth_token_is_valid(signed_message: &str, epoch_signed_time: &str) -> (AuthState, H160) {
    let signature = match Signature::from_str(signed_message) {
        Err(e) => {
            error!(
                "Error while parsing signature from signed message string {:?}",
                e
            );
            return (AuthState::Error, H160::zero());
        }
        Ok(s) => s,
    };
    let expected_signed_epoch_time = match epoch_signed_time.parse::<i64>() {
        Err(e) => {
            error!(
                "Error while parsing epoch timestamp from message field of request!!! {:?}",
                e
            );
            return (AuthState::Error, H160::zero());
        }
        Ok(t) => t,
    };
    // Parse date from message epoch time and add our prefix before recovering addr from signed message.
    let dt: DateTime<Utc> = DateTime::from_utc(
        NaiveDateTime::from_timestamp(expected_signed_epoch_time, 0),
        Utc,
    );
    let now = Utc::now();
    let diff = now - dt;

    if diff.num_hours() > SIGNATURE_HOURS_TILL_EXPIRY || now < dt {
        return (AuthState::Expired, H160::zero());
    }

    // Add our specific prefix to user-passed
    let full_expected_signed_message = &*format!("Split app login: {}", epoch_signed_time);

    match signature.recover(full_expected_signed_message) {
        Err(_) => return (AuthState::Error, H160::zero()),
        Ok(addr) => (AuthState::Authorized, addr),
    }
}

fn get_token_and_validate(req: &Request) -> Result<String, AuthError> {
    let message = match req.headers().get_one("epoch_signed_time") {
        None => return Err(AuthError::Missing),
        Some(key) => key,
    };

    match req.headers().get_one("Authorization") {
        None => Err(AuthError::Missing),
        Some(key) => {
            let stripped_key = key.trim_start_matches("Bearer ");
            let (valid, address): (AuthState, H160) = auth_token_is_valid(stripped_key, message);
            if matches!(valid, AuthState::Authorized) {
                Ok(format!("0x{}", address.encode_hex::<String>()))
            } else if matches!(valid, AuthState::Expired) {
                Err(AuthError::Expired)
            } else {
                Err(AuthError::Invalid)
            }
        }
    }
}
