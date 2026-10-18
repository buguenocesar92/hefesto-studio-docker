#!/usr/bin/env bash
# Comprueba que el compose de este repo cumple el contrato mínimo para
# ser desplegado por Coolify detrás de Traefik.
#
# - Renderiza el compose con valores ficticios no secretos.
# - Para cada servicio sin profiles exige el contrato Coolify.
# - Falla con "servicio: motivo" ante cualquier desviación.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
compose_rel="compose.yaml"
compose_path="$repo_root/$compose_rel"

if [ ! -f "$compose_path" ]; then
  echo "FAIL: no se encuentra $compose_rel en la raíz del repo"
  exit 1
fi

# Variables ${VAR} (con o sin default) referenciadas por el compose.
vars=$(grep -oE '\$\{[A-Z_][A-Z0-9_]*[^}]*\}' "$compose_path" \
  | sed -E 's/^\$\{([A-Z_][A-Z0-9_]*).*$/\1/' \
  | sort -u)

# Directorio temporal aislado: ahí copiamos lo mínimo para renderizar.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
tmp_env="$tmp/env"

# .env ficticio: valores no secretos para renderizar; URL/host ficticios.
> "$tmp_env"
for v in $vars; do
  case "$v" in
    *PORT*)
      # Docker espera enteros en *PORT; los ficticios no pueden ser alfabéticos.
      echo "$v=10080" >> "$tmp_env"
      ;;
    *URL*|*WEBHOOK*|*ENDPOINT*)
      echo "$v=https://ejemplo.invalid" >> "$tmp_env"
      ;;
    *SITE_ADDRESS*)
      echo "$v=https://ejemplo.invalid" >> "$tmp_env"
      ;;
    *HOST*)
      echo "$v=db" >> "$tmp_env"
      ;;
    *)
      echo "$v=x1234567890abcdef" >> "$tmp_env"
      ;;
  esac
done

cp "$compose_path" "$tmp/compose.yaml"
[ -f "$repo_root/Dockerfile" ] && cp "$repo_root/Dockerfile" "$tmp/Dockerfile"
> "$tmp/.env"

if ! render_json=$(docker compose -f "$tmp/compose.yaml" \
    --env-file "$tmp_env" \
    --project-directory "$tmp" \
    config --format json 2> "$tmp/stderr"); then
  echo "FAIL: docker compose config no pudo renderizar:"
  cat "$tmp/stderr"
  exit 1
fi

fail=0

# Solo los servicios sin profiles están sujetos al contrato.
services_no_profile=$(printf '%s' "$render_json" | jq -r '
  .services
  | to_entries
  | map(select((.value.profiles // []) | length == 0))
  | map(.key)
  | .[]
')

for svc in $services_no_profile; do
  s=$(printf '%s' "$render_json" | jq -c ".services[\"$svc\"]")

  ports=$(printf '%s' "$s" | jq -c '.ports // []')
  if [ "$(printf '%s' "$ports" | jq 'length')" != "0" ]; then
    echo "FAIL: $svc expone $ports (Traefik debe enrutar)"
    fail=1
  fi

  cn=$(printf '%s' "$s" | jq -r '.container_name // empty')
  if [ -n "$cn" ]; then
    echo "FAIL: $svc fija container_name=$cn"
    fail=1
  fi

  for k in privileged cap_add devices; do
    val=$(printf '%s' "$s" | jq ".$k // null")
    if [ "$val" != "null" ]; then
      echo "FAIL: $svc define $k=$val"
      fail=1
    fi
  done

  for k in network_mode pid ipc; do
    v=$(printf '%s' "$s" | jq -r ".$k // empty")
    if [ "$v" = "host" ]; then
      echo "FAIL: $svc comparte $k=host con el VPS"
      fail=1
    fi
  done

  sec=$(printf '%s' "$s" | jq -r '.security_opt // [] | .[]?' 2>/dev/null || true)
  if printf '%s\n' "$sec" | grep -q "unconfined"; then
    echo "FAIL: $svc usa security_opt=unconfined"
    fail=1
  fi

  mounts=$(printf '%s' "$s" | jq -r '.volumes // [] | .[]? | .source // empty')
  for m in $mounts; do
    case "$m" in
      /var/run/docker.sock|/proc*|/sys*|/dev/*)
        echo "FAIL: $svc monta ruta del host fuera del repo: $m"
        fail=1
        ;;
    esac
  done
done

name_violations=$(python3 - "$compose_path" <<'PY'
import sys, yaml
with open(sys.argv[1]) as f:
    spec = yaml.safe_load(f) or {}
errs = []
if isinstance(spec.get("name"), str):
    errs.append("el compose declara name: raíz fijo")
for scope in ("networks", "volumes"):
    for k, v in (spec.get(scope) or {}).items():
        if isinstance(v, dict) and isinstance(v.get("name"), str):
            errs.append(f"{scope}.{k}.name = {v['name']} (fijo)")
print("\n".join(errs))
PY
)
if [ -n "$name_violations" ]; then
  while IFS= read -r line; do
    [ -n "$line" ] && echo "FAIL: $line"
  done <<< "$name_violations"
  fail=1
fi

# Las apps con bd: supabase-pg deben parametrizar DB_NAME y DB_SSLMODE.
# Este repo usa postgres-local, así que la comprobación se omite salvo
# que el compose declare servicios de tipo supabase-pg explícitamente.

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "OK: compose cumple contrato Coolify"
