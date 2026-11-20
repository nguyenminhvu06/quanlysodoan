#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$DATA_DIR/compose.yaml"

if ! docker info >/dev/null 2>&1; then
  echo "Docker Engine chưa chạy. Hãy mở Docker Desktop rồi chạy lại script." >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_isready -U sa -d postgres >/dev/null 2>&1; then
  echo "PostgreSQL chưa chạy hoặc chưa sẵn sàng. Hãy chạy start.sh trước." >&2
  exit 1
fi

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U sa -d postgres < "$DATA_DIR/init.sql"

echo "Đã cập nhật schema từ database/init.sql."
