#!/bin/sh

export DB_PASSWORD=$(cat /run/secrets/db_password)
export ACCESS_TOKEN_SECRET=$(cat /run/secrets/access_token)
export REFRESH_TOKEN_SECRET=$(cat /run/secrets/refresh_token)

exec "$@"