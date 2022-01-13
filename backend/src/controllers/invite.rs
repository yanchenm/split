use log::error;
use rocket::State;
use rocket::{http::Status, serde::Deserialize};
use sqlx::MySqlPool;

use crate::db::memberships;
use crate::db::{groups, invite};
use crate::models::membership::MembershipStatus;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

#[derive(Debug, Deserialize)]
pub struct CreateGroupRequest {
    pub name: String,
    pub currency: String,
    pub description: Option<String>,
}

#[post("/<group_id>", format = "json")]
pub async fn create_invite<'r>(
    group_id: String,
    pool: &State<MySqlPool>,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    // Check if the inviter is in the group
    match memberships::get_membership_by_group_and_user(
        pool,
        group_id.as_str(),
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(MembershipStatus::OWNER | MembershipStatus::ACTIVE)) => (),
        Ok(_) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "authed user is not a member of the group".to_string(),
            };
        }
        Err(e) => {
            error!("error getting membership in db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to get membership in db".to_string(),
            };
        }
    }

    // Create invite and get id
    match invite::create_new_invite(pool, group_id.as_str(), authed_user.address.as_str()).await {
        Ok(id) => StringResponseWithStatus {
            status: Status::Ok,
            message: id,
        },
        Err(e) => {
            error!("error creating invite in db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to create new invite in db".to_string(),
            };
        }
    }
}

#[post("/<invite_code>/accept")]
pub async fn accept_invite_to_group<'r>(
    pool: &State<MySqlPool>,
    invite_code: String,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    // Get the invite
    let invite = match invite::get_invite_by_code(pool, &invite_code).await {
        Ok(Some(invite)) => {
            if invite.isActive == 0 {
                return StringResponseWithStatus {
                    status: Status::Gone,
                    message: "Invite not active".to_string(),
                };
            } else {
                invite
            }
        }
        _ => {
            return StringResponseWithStatus {
                status: Status::NotFound,
                message: "Invite not found".to_string(),
            }
        }
    };

    // Check if the group exists
    match groups::get_group_by_id(pool, invite.group_id.as_str()).await {
        Ok(Some(_)) => (),
        _ => {
            return StringResponseWithStatus {
                status: Status::Gone,
                message: "group for invite does not exist".to_string(),
            };
        }
    };

    // Check if the acceptor is in the group
    match memberships::get_membership_by_group_and_user(
        pool,
        invite.group_id.as_str(),
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(MembershipStatus::OWNER | MembershipStatus::ACTIVE)) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "user is already in the group".to_string(),
            }
        }
        Ok(_) => (),
        Err(e) => {
            error!("error getting membership in db: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to get membership in db".to_string(),
            };
        }
    }

    // Create membership
    match memberships::create_new_membership(
        pool,
        authed_user.address.as_str(),
        invite.group_id.as_str(),
        MembershipStatus::ACTIVE,
    )
    .await
    {
        Ok(_) => StringResponseWithStatus {
            status: Status::Ok,
            message: "Successfully joined group!".to_string(),
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
