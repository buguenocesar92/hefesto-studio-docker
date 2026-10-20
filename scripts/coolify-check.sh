#!/usr/bin/env bash
# Comprueba que el compose de este repo cumple el contrato mínimo para
# ser desplegado por Coolify detrás de Traefik.
#
# Uso: scripts/coolify-check.sh [ruta-al-compose]
# Por defecto usa compose.yaml en la raíz del repo.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
compose_path="${1:-$repo_root/compose.yaml}"

if [ ! -f "$compose_path" ]; then
  echo "FAIL: no se encuentra $compose_path"
  exit 1
fi

# Variables ${VAR} (con o sin default) referenciadas por el compose.
vars=$(grep -oE '\$\{[A-Z_][A-Z0-9_]*[^}]*\}' "$compose_path" \
  | sed -E 's/^\$\{([A-Z_][A-Z0-9_]*).*$/\1/' \
  | sort -u)

tmp="$(mktemp -d)"
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

# Si el compose referencia un .env relativo, asegura que exista (vacío)
# en $repo_root para que docker compose config pueda renderizar. .env
# está gitignorado y se elimina al salir; nunca se lee desde el shell.
created_dotenv=0
if grep -qE '^[[:space:]]*env_file:[[:space:]]*\.env([[:space:]]|$)' "$compose_path" \
   && [ ! -f "$repo_root/.env" ]; then
  : > "$repo_root/.env"
  created_dotenv=1
fi
trap 'rm -rf "$tmp"; [ "$created_dotenv" = "1" ] && rm -f "$repo_root/.env"' EXIT

# Renderizar contra el repo (no en un temporal) para que los binds se
# resuelvan relativos a $repo_root; con --env-file explícito no se
# sustituyen variables desde el entorno del shell.
if ! render_json=$(docker compose \
    --project-directory "$repo_root" \
    -f "$compose_path" \
    --env-file "$tmp_env" \
    config --format json 2> "$tmp/stderr"); then
  echo "FAIL: docker compose config no pudo renderizar:"
  cat "$tmp/stderr"
  exit 1
fi

fail=0
project_dir="$repo_root"

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

  # Binds: solo se permiten rutas dentro del repo o el repo mismo.
  bind_sources=$(printf '%s' "$s" | jq -r '.volumes // [] | .[] | select(.type=="bind") | .source')
  while IFS= read -r m; do
    [ -z "$m" ] && continue
    if [[ "$m" == *docker.sock* ]]; then
      echo "FAIL: $svc monta docker.sock: $m"
      fail=1
      continue
    fi
    if [ "$m" != "$project_dir" ] && [[ "$m" != "$project_dir"/* ]]; then
      echo "FAIL: $svc: bind fuera del repo: $m"
      fail=1
    fi
  done <<< "$bind_sources"
done

# name: raíz y nombres fijos de redes/volúmenes del compose fuente.
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

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "OK: compose cumple contrato Coolify"