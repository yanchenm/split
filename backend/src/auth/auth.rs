use std::marker::PhantomData;

use ethers::abi::ethereum_types::H160;
use ethers::core::types::Signature;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};

pub struct AuthedUser<'r> {
    pub address: String,
    phantom: PhantomData<&'r String>,
}

#[derive(Debug)]
pub enum AuthedUserError {
    Missing,
    Invalid,
}

fn auth_token_is_valid(signed_message: &str, message: &str) -> (bool, H160) {
    let signed_bytes: &[u8] = signed_message.as_bytes();
    let signature = match Signature::try_from(signed_bytes) {
        Err(_) => return (false, H160::zero()),
        Ok(s) => s,
    };
    match signature.recover(message) {
        Err(_) => return (false, H160::zero()),
        Ok(addr) => (true, addr),
    }
    // TODO: Verify message has some specific format i.e. "split harmony <date>"
    // TODO: Validate signed date is not past expiry threshold
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthedUser<'r> {
    type Error = AuthedUserError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let message = match req.headers().get_one("message") {
            None => return Outcome::Failure((Status::BadRequest, AuthedUserError::Missing)),
            Some(key) => key,
        };

        match req.headers().get_one("authorization") {
            None => Outcome::Failure((Status::BadRequest, AuthedUserError::Missing)),
            Some(key) => {
                let (valid, address): (bool, H160) = auth_token_is_valid(key, message);
                if valid {
                    Outcome::Success(AuthedUser {
                        address: address.to_string(),
                        phantom: PhantomData,
                    })
                } else {
                    Outcome::Failure((Status::Unauthorized, AuthedUserError::Invalid))
                }
            }
        }
    }
}
