use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::State;
use sqlx::MySqlPool;

use std::marker::PhantomData;

use crate::db::users;

use super::{get_token_and_validate, AuthError};

pub struct AuthedUser<'r> {
    pub address: String,
    phantom: PhantomData<&'r String>,
}

pub struct AuthedDBUser<'r> {
    pub address: String,
    pub username: String,
    pub email: Option<String>,
    phantom: PhantomData<&'r String>,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthedUser<'r> {
    type Error = AuthError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        match get_token_and_validate(req) {
            Ok(address) => Outcome::Success(AuthedUser {
                address,
                phantom: PhantomData,
            }),
            Err(e) => match e {
                AuthError::Missing => Outcome::Failure((Status::BadRequest, e)),
                _ => Outcome::Failure((Status::Unauthorized, e)),
            },
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthedDBUser<'r> {
    type Error = AuthError;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let address = match get_token_and_validate(req) {
            Ok(address) => address,
            Err(e) => {
                return match e {
                    AuthError::Missing => Outcome::Failure((Status::BadRequest, e)),
                    _ => Outcome::Failure((Status::Unauthorized, e)),
                }
            }
        };

        let db_pool = req.guard::<&State<MySqlPool>>().await;
        match db_pool {
            Outcome::Success(db_pool) => {
                // Check that the user exists
                match users::get_user_by_address(db_pool, address.as_str()).await {
                    Ok(Some(user)) => {
                        return Outcome::Success(AuthedDBUser {
                            address: user.address,
                            username: user.username,
                            email: user.email,
                            phantom: PhantomData,
                        });
                    }
                    _ => {
                        return Outcome::Failure((Status::Unauthorized, AuthError::NoUser));
                    }
                };
            }
            _ => {
                error!("error getting db pool");
                return Outcome::Failure((Status::InternalServerError, AuthError::Failed));
            }
        }
    }
}
