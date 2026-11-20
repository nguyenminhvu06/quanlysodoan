#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$DATA_DIR/compose.yaml"
DB_USER="sa"

if ! docker info >/dev/null 2>&1; then
  echo "Docker Engine chưa chạy. Hãy mở Docker Desktop rồi chạy lại script." >&2
  exit 1
fi

docker compose -f "$COMPOSE_FILE" up -d postgres

ready=false
for ((attempt = 1; attempt <= 30; attempt++)); do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres \
    pg_isready -U "$DB_USER" -d postgres >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done

if [[ "$ready" != true ]]; then
  docker compose -f "$COMPOSE_FILE" logs --tail=80 postgres >&2
  echo "PostgreSQL không sẵn sàng sau 60 giây." >&2
  exit 1
fi

echo "PostgreSQL đang chạy. Không thực hiện khởi tạo hoặc nạp lại dữ liệu."
