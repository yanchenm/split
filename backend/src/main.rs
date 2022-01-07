#[macro_use] extern crate rocket;

#[get("/hello/<name>")]
fn hello(name: &str) -> String {
    format!("{} can suck my cock", name)
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![hello])
}