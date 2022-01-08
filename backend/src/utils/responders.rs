use std::io::Cursor;

use rocket::http::ContentType;
use rocket::response::{self, Responder, Response};
use rocket::{http::Status, Request};

#[derive(Debug)]
pub struct StringResponseWithStatus {
    pub status: Status,
    pub message: String,
}

impl<'r> Responder<'r, 'static> for StringResponseWithStatus {
    fn respond_to(self, _: &Request) -> response::Result<'static> {
        Response::build()
            .header(ContentType::Plain)
            .status(self.status)
            .sized_body(self.message.len(), Cursor::new(self.message))
            .ok()
    }
}
