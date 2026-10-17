#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
file=${1:?Usage: restore.sh backups/file.dump CONFIRM_RESTORE}
[ "${2:-}" = CONFIRM_RESTORE ] || { echo 'Explicit CONFIRM_RESTORE required'; exit 1; }
[ -f "$file" ] || exit 1
sh portable/scripts/backup.sh
docker compose stop app
# Failure keeps app stopped to prevent writes to partial restore.
docker compose exec -T db sh -c 'pg_restore --exit-on-error --single-transaction --clean --if-exists -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$file"
docker compose start app
