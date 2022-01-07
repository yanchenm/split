# Use the official Rust image.
# https://hub.docker.com/_/rust
FROM rust:1.57

WORKDIR /usr/src/app

# Create a dummy.rs file to allow dependency caching
RUN echo "fn main() {}" > dummy.rs

# Manipulate Cargo.toml to use dummy.rs
COPY Cargo.toml .
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN cargo build --release
RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml

# Copy actual code files and build
COPY . .
RUN cargo build --release

# Run the web service on container startup.
CMD ["target/release/backend"]