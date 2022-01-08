use log::error;
use rocket::State;
use rocket::{http::Status, serde::json::Json};
use sqlx::MySqlPool;

use crate::db::groups;
use crate::db::memberships;
use crate::models::membership::MembershipStatus;
use crate::{
    auth::auth::AuthedUser, db::users, models::group::Group,
    utils::responders::StringResponseWithStatus,
};

#[post("/", format = "json", data = "<new_group>")]
pub async fn create_group<'r>(
    new_group: Json<Group>,
    pool: &State<MySqlPool>,
    user: AuthedUser<'r>,
) -> StringResponseWithStatus {
    // Check if the user exists
    match users::get_user_by_address(pool, user.address.as_str()).await {
        Ok(Some(_)) => (),
        _ => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "authed user does not exist".to_string(),
            };
        }
    };

    // Create group and get id
    let group_id = match groups::create_new_group(
        pool,
        new_group.name.as_str(),
        new_group.description.as_ref().map(|s| s.as_str()),
    )
    .await
    {
        Ok(id) => id,
        Err(e) => {
            error!("error creating group in db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to create new group in db".to_string(),
            };
        }
    };

    // User who created the group automatically becomes an active member
    match memberships::create_new_membership(
        pool,
        user.address.as_str(),
        group_id.as_str(),
        MembershipStatus::OWNER,
    )
    .await
    {
        Ok(_) => StringResponseWithStatus {
            status: Status::Ok,
            message: group_id,
        },
        Err(e) => {
            error!("error creating membership in db: {}", e);
            StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to create new membership in db".to_string(),
            }
        }
    }
}
