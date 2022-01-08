use crate::db::users::{create_new_user, get_user_by_address};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

use crate::models::user::User;

#[post("/user", format = "json", data = "<new_user>")]
pub async fn create_user(new_user: Json<User>, pool: &State<MySqlPool>) -> Status {
    // Check if the user already exists
    match get_user_by_address(pool, new_user.address.as_str()).await {
        Ok(Some(_)) => {
            return Status::BadRequest;
        }
        Ok(None) => (),
        Err(_) => {
            return Status::InternalServerError;
        }
    }

    match create_new_user(
        pool,
        new_user.address.as_str(),
        new_user.username.as_str(),
        new_user.email.as_ref().map(|s| s.as_str()),
    )
    .await
    {
        Ok(_) => Status::Created,
        Err(_) => Status::InternalServerError,
    }
}
