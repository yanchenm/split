use chrono::prelude::*;
use ethers::abi::ethereum_types::H160;
use ethers::core::types::Signature;
use ethers::utils::hex::ToHex;
use log::error;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use std::marker::PhantomData;
use std::str::FromStr;

pub struct AuthedUser<'r> {
    pub address: String,
    phantom: PhantomData<&'r String>,
}

#[derive(Debug)]
pub enum AuthedUserError {
    Missing,
    Invalid,
    Expired,
}

enum AuthedState {
    Authorized,
    Expired,
    Error,
}

const SIGNATURE_HOURS_TILL_EXPIRY: i64 = 24 * 14;

fn auth_token_is_valid(signed_message: &str, epoch_signed_time: &str) -> (AuthedState, H160) {
    let signature = match Signature::from_str(signed_message) {
        Err(e) => {
            error!(
                "Error while parsing signature from signed message string {:?}",
                e
            );
            return (AuthedState::Error, H160::zero());
        }
        Ok(s) => s,
    };
    let expected_signed_epoch_time = match epoch_signed_time.parse::<i64>() {
        Err(e) => {
            error!(
                "Error while parsing epoch timestamp from message field of request!!! {:?}",
                e
            );
            return (AuthedState::Error, H160::zero());
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
        return (AuthedState::Expired, H160::zero());
    }

    // Add our specific prefix to user-passed
    let full_expected_signed_message = &*format!("Split app login: {}", epoch_signed_time);

    match signature.recover(full_expected_signed_message) {
        Err(_) => return (AuthedState::Error, H160::zero()),
        Ok(addr) => (AuthedState::Authorized, addr),
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthedUser<'r> {
    type Error = AuthedUserError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let message = match req.headers().get_one("epoch_signed_time") {
            None => return Outcome::Failure((Status::BadRequest, AuthedUserError::Missing)),
            Some(key) => key,
        };

        match req.headers().get_one("authorization") {
            None => Outcome::Failure((Status::BadRequest, AuthedUserError::Missing)),
            Some(key) => {
                let (valid, address): (AuthedState, H160) = auth_token_is_valid(key, message);
                if matches!(valid, AuthedState::Authorized) {
                    Outcome::Success(AuthedUser {
                        address: format!("0x{}", address.encode_hex::<String>()),
                        phantom: PhantomData,
                    })
                } else if matches!(valid, AuthedState::Expired) {
                    Outcome::Failure((Status::Unauthorized, AuthedUserError::Expired))
                } else {
                    Outcome::Failure((Status::Unauthorized, AuthedUserError::Invalid))
                }
            }
        }
    }
}
