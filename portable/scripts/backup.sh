#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
umask 077
mkdir -p backups
file="backups/hefesto-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$file.tmp"
test -s "$file.tmp"
mv "$file.tmp" "$file"
printf 'Backup created: %s\n' "$file"
