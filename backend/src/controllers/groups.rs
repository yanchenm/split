use log::error;
use rocket::State;
use rocket::{
    http::Status,
    serde::{json::Json, Deserialize},
};
use sqlx::MySqlPool;

use crate::db::currency_pairs::does_currency_have_rate;
use crate::db::groups;
use crate::db::memberships;
use crate::models::group::Group;
use crate::models::membership::MembershipStatus;
use crate::models::user::UserDb;
use crate::{auth::user::AuthedDBUser, utils::responders::StringResponseWithStatus};

#[derive(Debug, Deserialize)]
pub struct CreateGroupRequest {
    pub name: String,
    pub currency: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct InviteToGroupRequest {
    user_id: String,
}

#[post("/", format = "json", data = "<new_group>")]
pub async fn create_group<'r>(
    new_group: Json<CreateGroupRequest>,
    pool: &State<MySqlPool>,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    // Check that given currency is a supported currency
    match does_currency_have_rate(pool, new_group.currency.as_str()).await {
        Ok(false) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: format!("{} is not a supported currency", new_group.currency),
            }
        }
        Ok(true) => (),
        Err(e) => {
            error!("error checking if currency has rate: {}", e);
            return StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to check if currency is supported".to_string(),
            };
        }
    }

    // Create group and get id
    let group_id = match groups::create_new_group(
        pool,
        new_group.name.as_str(),
        new_group.currency.as_str(),
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
        authed_user.address.as_str(),
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

#[post("/<group_id>/invite", format = "json", data = "<invite>")]
pub async fn invite_to_group<'r>(
    pool: &State<MySqlPool>,
    group_id: String,
    invite: Json<InviteToGroupRequest>,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    // Check if the group exists
    match groups::get_group_by_id(pool, group_id.as_str()).await {
        Ok(Some(_)) => (),
        _ => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "group does not exist".to_string(),
            };
        }
    };

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

    // Check if the user is already a member
    match memberships::get_membership_by_group_and_user(
        pool,
        group_id.as_str(),
        invite.user_id.as_str(),
    )
    .await
    {
        Ok(Some(_)) => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "user is already a member".to_string(),
            };
        }
        _ => (),
    };

    // Create membership
    match memberships::create_new_membership(
        pool,
        invite.user_id.as_str(),
        group_id.as_str(),
        MembershipStatus::INVITED,
    )
    .await
    {
        Ok(_) => StringResponseWithStatus {
            status: Status::Ok,
            message: "user invited".to_string(),
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

#[post("/<group_id>/accept")]
pub async fn accept_invite_to_group<'r>(
    pool: &State<MySqlPool>,
    group_id: &str,
    authed_user: AuthedDBUser<'r>,
) -> StringResponseWithStatus {
    // Check that the invite exists
    match memberships::get_membership_by_group_and_user(
        pool,
        group_id,
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(MembershipStatus::INVITED)) => (),
        _ => {
            return StringResponseWithStatus {
                status: Status::BadRequest,
                message: "invite does not exist".to_string(),
            };
        }
    };

    // Update membership
    match memberships::update_membership_status(
        pool,
        group_id,
        authed_user.address.as_str(),
        MembershipStatus::ACTIVE,
    )
    .await
    {
        Ok(_) => StringResponseWithStatus {
            status: Status::Ok,
            message: "invite accepted".to_string(),
        },
        Err(e) => {
            error!("error updating membership in db: {}", e);
            StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to update membership in db".to_string(),
            }
        }
    }
}

#[get("/<group_id>")]
pub async fn get_group<'r>(
    pool: &State<MySqlPool>,
    group_id: &str,
    authed_user: AuthedDBUser<'r>,
) -> Result<Json<Group>, StringResponseWithStatus> {
    // Check if user is in the group
    match memberships::get_membership_by_group_and_user(
        pool,
        group_id,
        authed_user.address.as_str(),
    )
    .await
    {
        Ok(Some(membership)) => match membership {
            MembershipStatus::OWNER | MembershipStatus::ACTIVE => (),
            _ => {
                return Err(StringResponseWithStatus {
                    status: Status::BadRequest,
                    message: "authed user is not a member of the group".to_string(),
                });
            }
        },
        Ok(None) => {
            return Err(StringResponseWithStatus {
                status: Status::BadRequest,
                message: "authed user is not a member of the group".to_string(),
            });
        }
        Err(e) => {
            error!("error getting membership in db: {}", e);
            return Err(StringResponseWithStatus {
                status: Status::InternalServerError,
                message: "failed to get membership in db".to_string(),
            });
        }
    }

    match groups::get_group_by_id(pool, group_id).await {
        Ok(Some(group)) => Ok(Json(group)),
        Ok(None) => Err(StringResponseWithStatus {
            status: Status::BadRequest,
            message: "Group not found".to_string(),
        }),
        Err(_) => Err(StringResponseWithStatus {
            status: Status::InternalServerError,
            message: "Failed to get group due to error".to_string(),
        }),
    }
}

#[get("/")]
pub async fn get_groups_by_user<'r>(
    pool: &State<MySqlPool>,
    authed_user: AuthedDBUser<'r>,
) -> Result<Json<Vec<Group>>, StringResponseWithStatus> {
    match groups::get_groups_by_user(pool, authed_user.address.as_str()).await {
        Ok(groups) => Ok(Json(groups)),
        Err(_) => Err(StringResponseWithStatus {
            status: Status::InternalServerError,
            message: "Failed to get groups due to server error".to_string(),
        }),
    }
}

#[get("/<group_id>/users")]
pub async fn get_users_in_group<'r>(
    pool: &State<MySqlPool>,
    group_id: &str,
    _authed_user: AuthedDBUser<'r>,
) -> Result<Json<Vec<UserDb>>, StringResponseWithStatus> {
    match groups::get_users_in_group(pool, group_id).await {
        Ok(users) => Ok(Json(users)),
        Err(_) => Err(StringResponseWithStatus {
            status: Status::InternalServerError,
            message: "Failed to get users due to server error".to_string(),
        }),
    }
}
