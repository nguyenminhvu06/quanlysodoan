#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$DATA_DIR/compose.yaml"
DB_USER="sa"
LEGACY_DB_USER="quan_ly_so_doan"

if ! docker info >/dev/null 2>&1; then
  echo "Docker Engine chưa chạy. Hãy mở Docker Desktop rồi chạy lại script." >&2
  exit 1
fi

if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_isready -U "$DB_USER" -d postgres >/dev/null 2>&1; then
  echo "PostgreSQL chưa chạy hoặc chưa sẵn sàng. Hãy chạy start.sh trước." >&2
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

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U "$DB_USER" -d postgres <<'SQL'
SELECT 'CREATE ROLE sa WITH LOGIN SUPERUSER PASSWORD ''sapassword'''
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sa')
\gexec

ALTER ROLE sa WITH LOGIN SUPERUSER PASSWORD 'sapassword';
SELECT 'ALTER DATABASE quan_ly_so_doan OWNER TO sa'
WHERE EXISTS (SELECT 1 FROM pg_database WHERE datname = 'quan_ly_so_doan')
\gexec
SQL

docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U sa -d postgres < "$DATA_DIR/init.sql"

read -r -p "Email nhận OTP [takin2k5@gmail.com]: " recovery_email
recovery_email="${recovery_email:-takin2k5@gmail.com}"
read -r -p "Tài khoản Gmail gửi OTP [$recovery_email]: " smtp_username
smtp_username="${smtp_username:-$recovery_email}"
read -r -p "Máy chủ SMTP [smtp.gmail.com]: " smtp_host
smtp_host="${smtp_host:-smtp.gmail.com}"
read -r -p "Cổng SMTP [587]: " smtp_port
smtp_port="${smtp_port:-587}"

if [[ "$recovery_email" != *@* || "$smtp_username" != *@* ]]; then
  echo "Email nhận OTP và tài khoản gửi OTP phải là địa chỉ email hợp lệ." >&2
  exit 1
fi
if [[ -z "$smtp_host" || "$smtp_host" == *"://"* || "$smtp_host" =~ [[:space:]] ]]; then
  echo "Máy chủ SMTP không hợp lệ." >&2
  exit 1
fi
if [[ ! "$smtp_port" =~ ^[0-9]+$ ]] || (( smtp_port < 1 || smtp_port > 65535 )); then
  echo "Cổng SMTP phải là số từ 1 đến 65535." >&2
  exit 1
fi

read -r -s -p "Mật khẩu ứng dụng email (không hiển thị khi nhập): " smtp_app_password
printf '\n'
if [[ -z "$smtp_app_password" ]]; then
  echo "Mật khẩu ứng dụng email không được để trống." >&2
  exit 1
fi

PROJECT_DIR="$(cd "$DATA_DIR/.." && pwd)"
printf '%s' "$smtp_app_password" | cargo run --quiet \
  --manifest-path "$PROJECT_DIR/app/src-tauri/Cargo.toml" \
  --bin store_smtp_credential
unset smtp_app_password

python3 - "$recovery_email" "$smtp_username" "$smtp_host" "$smtp_port" <<'PY' | docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U sa -d quan_ly_so_doan
import csv
import hashlib
import secrets
import sys

recovery_email, smtp_username, smtp_host, smtp_port = sys.argv[1:]
bootstrap_token = secrets.token_hex(32)
bootstrap_token_hash = hashlib.sha256(bootstrap_token.encode()).hexdigest()
sys.stderr.write(
    "\nMã bootstrap (chỉ hiển thị lần này, nhập mã này trong app):\n"
    f"{bootstrap_token}\n\n"
)

writer = csv.writer(sys.stdout, lineterminator="\n")
sys.stdout.write(
    "BEGIN;\n"
    "CREATE TEMP TABLE bootstrap_input (\n"
    "  recovery_email text, smtp_host text, smtp_port integer,\n"
    "  smtp_username text, bootstrap_token_hash text\n"
    ");\n"
    "COPY bootstrap_input FROM STDIN WITH (FORMAT csv);\n"
)
writer.writerow([recovery_email, smtp_host, int(smtp_port), smtp_username, bootstrap_token_hash])
sys.stdout.write(
    "\\.\n"
    "INSERT INTO mail_settings (\n"
    "  singleton, recovery_email, smtp_host, smtp_port, smtp_username, updated_at\n"
    ")\n"
    "SELECT 1, recovery_email, smtp_host, smtp_port, smtp_username, now()\n"
    "FROM bootstrap_input\n"
    "ON CONFLICT (singleton) DO UPDATE SET\n"
    "  recovery_email = EXCLUDED.recovery_email,\n"
    "  smtp_host = EXCLUDED.smtp_host,\n"
    "  smtp_port = EXCLUDED.smtp_port,\n"
    "  smtp_username = EXCLUDED.smtp_username,\n"
    "  updated_at = now();\n"
    "UPDATE system_state\n"
    "SET bootstrap_token_hash = (SELECT bootstrap_token_hash FROM bootstrap_input)\n"
    "WHERE singleton = 1 AND initialized_at IS NULL;\n"
    "UPDATE accounts\n"
    "SET recovery_email = (SELECT recovery_email FROM bootstrap_input),\n"
    "    recovery_email_verified_at = NULL\n"
    "WHERE username = 'admin' AND person_type = 'SYSTEM' AND status = 'SETUP_REQUIRED';\n"
    "UPDATE otp_verifications\n"
    "SET consumed_at = now()\n"
    "WHERE purpose = 'SETUP_EMAIL' AND consumed_at IS NULL;\n"
    "COMMIT;\n"
)
PY

echo "Đã khởi tạo database và schema. Chạy insert.sh nếu cần nạp sinh viên mẫu."
echo "Cấu hình SMTP đã lưu trong database; mật khẩu ứng dụng đã lưu trong Keychain."
