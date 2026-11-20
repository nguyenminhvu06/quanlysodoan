#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$DATA_DIR/compose.yaml"
DB_NAME="quan_ly_so_doan"
DB_USER="sa"
LEGACY_DB_USER="quan_ly_so_doan"

if ! docker info >/dev/null 2>&1; then
  echo "Docker Engine chưa chạy. Hãy mở Docker Desktop rồi chạy lại script." >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_isready -U "$DB_USER" -d postgres >/dev/null 2>&1; then
  echo "PostgreSQL chưa chạy." >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U "$DB_USER" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -X -v ON_ERROR_STOP=1 -U "$LEGACY_DB_USER" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
    echo "Không thể kết nối bằng user '$DB_USER' hoặc user cũ '$LEGACY_DB_USER'." >&2
    exit 1
  fi

  DB_USER="$LEGACY_DB_USER"
fi

echo "CẢNH BÁO: thao tác này sẽ xóa database '$DB_NAME' và toàn bộ dữ liệu trong đó."
read -r -p "Nhập DROP để xác nhận: " confirmation
if [[ "$confirmation" != "DROP" ]]; then
  echo "Đã hủy."
  exit 1
fi

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U "$DB_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS $DB_NAME WITH (FORCE);"

echo "Đã xóa database '$DB_NAME'. Chạy init.sh để tạo lại schema."
