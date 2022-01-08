mod auth;
mod controllers;
mod db;
mod models;
mod utils;

#[macro_use]
extern crate rocket;

use crate::controllers::groups::create_group;
use crate::controllers::users::{create_user, get_authed_user};
use std::env;

#[get("/hello/<name>")]
fn hello(name: &str) -> String {
    format!("{} can suck my cock", name)
}

#[launch]
async fn rocket() -> _ {
    // Only load .env file if local
    match env::var("ENV") {
        Ok(val) if val == "prod" => (),
        _ => {
            dotenv::dotenv().ok();
        }
    }

    let db_host = env::var("DB_HOST").expect("DB_HOST is not set");
    let db_port = env::var("DB_PORT")
        .expect("DB_PORT is not set")
        .parse::<u16>()
        .expect("DB_PORT is not a number");
    let db_name = env::var("DB_NAME").expect("DB_NAME is not set");
    let db_user = env::var("DB_USER").expect("DB_USER is not set");
    let db_password = env::var("DB_PASSWORD").expect("DB_PASSWORD is not set");

    let pool = db::initialize(
        db_host.as_str(),
        db_port,
        db_name.as_str(),
        db_user.as_str(),
        db_password.as_str(),
    )
    .await
    .expect("Failed to initialize database");

    rocket::build()
        .mount("/", routes![hello])
        .mount("/user", routes![create_user, get_authed_user])
        .mount("/group", routes![create_group])
        .manage(pool)
}
