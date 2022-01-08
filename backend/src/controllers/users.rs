use crate::db::users::create_new_user;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::MySqlPool;

use crate::models::user::User;

#[post("/user", format = "json", data = "<new_user>")]
pub async fn create_user(new_user: Json<User>, pool: &State<MySqlPool>) -> Status {
    match create_new_user(
        pool,
        new_user.address.as_str(),
        new_user.username.as_str(),
        new_user.email.as_str(),
    )
    .await
    {
        Ok(_) => Status::Created,
        Err(_) => Status::InternalServerError,
    }
}
