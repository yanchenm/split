mod auth;
mod controllers;
mod db;
mod models;
mod utils;

#[macro_use]
extern crate rocket;

use crate::controllers::currency::refresh_currency_conversions;
use crate::controllers::groups::{
    accept_invite_to_group, create_group, get_group, get_groups_by_user, invite_to_group,
};
use crate::controllers::transactions::{
    create_transaction, get_transactions_by_group, update_transaction,
};
use crate::controllers::users::{create_user, get_authed_user};
use std::env;

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
        .mount("/user", routes![create_user, get_authed_user])
        .mount(
            "/group",
            routes![
                create_group,
                invite_to_group,
                accept_invite_to_group,
                get_group,
                get_groups_by_user
            ],
        )
        .mount("/currency", routes![refresh_currency_conversions])
        .mount(
            "/transaction",
            routes![
                create_transaction,
                update_transaction,
                get_transactions_by_group
            ],
        )
        .manage(pool)
}
