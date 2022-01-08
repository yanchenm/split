use crate::auth::auth::AuthedUser;
use crate::db::users;
use crate::utils::responders::StringResponseWithStatus;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

use crate::models::user::User;

#[post("/", format = "json", data = "<new_user>")]
pub async fn create_user<'r>(
    new_user: Json<User>,
    pool: &State<MySqlPool>,
    user: AuthedUser<'r>,
) -> StringResponseWithStatus {
    if user.address != new_user.address.as_str() {
        return StringResponseWithStatus{
            status: Status::BadRequest,
            message: "User provided does not match authentication provided.".to_string(),
        }
    }
    
    // Check if the user already exists
    match users::get_user_by_address(pool, new_user.address.as_str()).await {
        Ok(Some(_)) => {
            return StringResponseWithStatus {
                status: Status::Conflict,
                message: "user already exists".to_string(),
            }
        }
        Ok(None) => (),
        Err(_) => {
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "error while checking if user exists".to_string(),
            }
        }
    }

    match users::create_new_user(
        pool,
        new_user.address.as_str(),
        new_user.username.as_str(),
        new_user.email.as_ref().map(|s| s.as_str()),
    )
    .await
    {
        Ok(_) => StringResponseWithStatus {
            status: Status::Created,
            message: "user created".to_string(),
        },
        Err(_) => StringResponseWithStatus {
            status: Status::InternalServerError,
            message: "error while creating user".to_string(),
        },
    }
}
