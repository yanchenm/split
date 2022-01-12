use crate::auth::user::{AuthedDBUser, AuthedUser};
use crate::db::users;
use crate::utils::responders::StringResponseWithStatus;

use log::error;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;
use serde::{Deserialize, Serialize};

use crate::models::user::UserDb;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: Option<String>,
}


#[post("/", format = "json", data = "<new_user>")]
pub async fn create_user<'r>(
    new_user: Json<CreateUserRequest>,
    pool: &State<MySqlPool>,
    authed_user: AuthedUser<'r>,
) -> StringResponseWithStatus {
    // Check if the user already exists
    match users::get_user_by_address(pool, authed_user.address.as_str()).await {
        Ok(Some(_)) => {
            return StringResponseWithStatus {
                status: Status::Conflict,
                message: "user already exists".to_string(),
            }
        }
        Ok(None) => (),
        Err(e) => {
            error!("error getting user from db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking if user exists".to_string(),
            };
        }
    }

    match users::create_new_user(
        pool,
        authed_user.address.as_str(),
        new_user.username.as_str(),
        new_user.email.as_ref().map(|s| s.as_str()),
    )
    .await
    {
        Ok(_) => StringResponseWithStatus {
            status: Status::Created,
            message: "user created".to_string(),
        },
        Err(e) => {
            error!("error creating user in db: {}", e);
            StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while creating user".to_string(),
            }
        }
    }
}

#[get("/")]
pub async fn get_authed_user<'r>(
    pool: &State<MySqlPool>,
    authed_user: AuthedDBUser<'r>,
) -> Result<Json<UserDb>, StringResponseWithStatus> {
    match users::get_user_by_address(pool, authed_user.address.as_str()).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(StringResponseWithStatus {
            status: Status::NotFound,
            message: "user not found".to_string(),
        }),
        Err(e) => {
            error!("error getting user from db: {}", e);
            Err(StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while getting user".to_string(),
            })
        }
    }
}
