#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
test -f .env || { echo 'Create .env from your private TXT or .env.example'; exit 1; }
docker compose build app
docker compose up -d db
docker compose run --rm app npm run migrate
docker compose run --rm app npm run seed
docker compose up -d
