FROM rustlang/rust:nightly as builder

RUN mkdir /build
WORKDIR /build

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

# Actual service can run on a slimmer base image
FROM debian:stable-slim
WORKDIR /usr/src/app

# Install necessary packages
RUN apt-get update \
    && apt-get install -y ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary over
COPY --from=builder /build/target/release/backend ./backend

# Copy env and config files from host
COPY Rocket.toml .env* ./

# Run the web service on container startup.
CMD ["./backend"]