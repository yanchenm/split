# split-backend

To run locally:
```shell
$ docker build -t split-backend .
$ docker run -dp 8000:8000 split-backend
```
Server will then be running on http://0.0.0.0:8000/

Run before committing  if SQL queries were modified:
```shell
cargo install sqlx-cli
cargo sqlx prepare
```