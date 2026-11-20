#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$DATA_DIR/compose.yaml"
DB_NAME="quan_ly_so_doan"
DB_USER="sa"

if ! docker info >/dev/null 2>&1; then
  echo "Docker Engine chưa chạy. Hãy mở Docker Desktop rồi chạy lại script." >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_isready -U "$DB_USER" -d postgres >/dev/null 2>&1; then
  echo "PostgreSQL chưa chạy. Hãy chạy scripts/init.sh trước." >&2
  exit 1
fi

existing_count="$(
  docker compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -X -v ON_ERROR_STOP=1 -At -U "$DB_USER" -d "$DB_NAME" \
    -c "SELECT count(*) FROM students;"
)"

if [[ "$existing_count" != "0" ]]; then
  echo "Bảng students đã có $existing_count dòng; từ chối nạp để tránh trùng dữ liệu." >&2
  exit 1
fi

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U "$DB_USER" -d postgres < "$DATA_DIR/seed_students.sql"

echo "Đã nạp dữ liệu sinh viên mẫu."
