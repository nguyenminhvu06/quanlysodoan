use keyring::{Entry, Error as KeyringError};
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use postgres_native_tls::MakeTlsConnector;
use rand::Rng;
use serde::{Deserialize, Serialize};
use tokio_postgres::config::SslMode;
use tokio_postgres::{Client, Config as PostgresConfig, Transaction};

const KEYRING_SERVICE: &str = "com.nguyenminhvu.app.database";
const KEYRING_ACCOUNT: &str = "connection";
const MAIL_KEYRING_SERVICE: &str = "com.nguyenminhvu.app.mail";
const MAIL_KEYRING_ACCOUNT: &str = "smtp_app_password";

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct DatabaseConnectionConfig {
    host: String,
    port: u16,
    database: String,
    username: String,
    password: String,
    use_ssl: bool,
}

struct MailSettings {
    recovery_email: String,
    smtp_host: String,
    smtp_port: u16,
    smtp_username: String,
    smtp_app_password: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthenticatedAccount {
    username: String,
    role: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct StaffProfile {
    staff_code: String,
    full_name: String,
    email: Option<String>,
    phone_number: Option<String>,
    account_username: Option<String>,
    account_role: Option<String>,
    account_status: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ManagedAccount {
    id: String,
    username: String,
    person_type: String,
    person_code: Option<String>,
    person_name: Option<String>,
    role: String,
    status: String,
}

fn validate_config(config: &DatabaseConnectionConfig) -> Result<(), String> {
    if config.host.trim().is_empty()
        || config.host.contains("://")
        || config.host.chars().any(char::is_whitespace)
    {
        return Err("Nhập hostname hoặc địa chỉ IP, không nhập URL có scheme.".to_string());
    }
    if config.port == 0 {
        return Err("Cổng PostgreSQL phải nằm trong khoảng 1 đến 65535.".to_string());
    }
    if config.database.trim().is_empty() {
        return Err("Tên database không được để trống.".to_string());
    }
    if config.username.trim().is_empty() {
        return Err("Tài khoản database không được để trống.".to_string());
    }
    if config.password.is_empty() {
        return Err("Mật khẩu database không được để trống.".to_string());
    }
    Ok(())
}

fn validate_new_admin_password(password: &str) -> Result<(), String> {
    validate_account_password(password)?;
    if password == "admin123" {
        return Err("Mật khẩu mới không được trùng mật khẩu tạm.".to_string());
    }
    Ok(())
}

fn validate_account_password(password: &str) -> Result<(), String> {
    if password.len() < 12
        || !password.chars().any(char::is_lowercase)
        || !password.chars().any(char::is_uppercase)
        || !password.chars().any(char::is_numeric)
        || !password
            .chars()
            .any(|character| !character.is_alphanumeric())
    {
        return Err(
            "Mật khẩu cần ít nhất 12 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
                .to_string(),
        );
    }
    Ok(())
}

fn normalize_optional(value: Option<String>) -> Option<String> {
    value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn mask_email_address(email: &str) -> String {
    let Some((local_part, domain)) = email.rsplit_once('@') else {
        return "***".to_string();
    };
    let local_characters = local_part.chars().collect::<Vec<_>>();
    let prefix = local_characters.iter().take(3).copied().collect::<String>();
    let last = local_characters.last().copied().unwrap_or('*');
    format!("{prefix}***{last}@{domain}")
}

fn validate_mail_settings(settings: &MailSettings) -> Result<(), String> {
    if !settings.recovery_email.contains('@')
        || !settings.smtp_username.contains('@')
        || settings.smtp_host.trim().is_empty()
        || settings.smtp_host.contains("://")
        || settings.smtp_host.chars().any(char::is_whitespace)
        || settings.smtp_port == 0
        || settings.smtp_app_password.trim().is_empty()
    {
        return Err("Cấu hình email trong database hoặc Keychain không hợp lệ.".to_string());
    }
    Ok(())
}

fn connection_entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
        .map_err(|error| format!("Không thể mở kho thông tin xác thực của hệ điều hành: {error}"))
}

fn read_saved_config() -> Result<Option<DatabaseConnectionConfig>, String> {
    let entry = connection_entry()?;
    match entry.get_password() {
        Ok(serialized) => serde_json::from_str(&serialized)
            .map(Some)
            .map_err(|error| format!("Cấu hình database đã lưu không hợp lệ: {error}")),
        Err(KeyringError::NoEntry) => Ok(None),
        Err(error) => Err(format!(
            "Không thể đọc trạng thái cấu hình từ kho bảo mật: {error}"
        )),
    }
}

async fn require_admin(
    transaction: &Transaction<'_>,
    actor_username: &str,
) -> Result<String, String> {
    let account = transaction
        .query_opt(
            "SELECT id::text
             FROM accounts
             WHERE username = lower($1)
               AND person_type = 'SYSTEM'
               AND role = 'ADMIN'
               AND status = 'ACTIVE'
             FOR UPDATE",
            &[&actor_username],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra quyền Admin: {error}"))?;

    account
        .map(|row| row.get(0))
        .ok_or_else(|| "Chỉ Admin đang hoạt động được phép thực hiện thao tác này.".to_string())
}

async fn record_security_audit(
    transaction: &Transaction<'_>,
    actor_id: &str,
    action: &str,
    target_type: &str,
    target_id: &str,
    old_values: Option<String>,
    new_values: Option<String>,
) -> Result<(), String> {
    transaction
        .execute(
            "INSERT INTO security_audit_logs (
                actor_account_id, action, target_type, target_id, old_values, new_values
             )
             VALUES ($1::text::uuid, $2, $3, $4, $5::text::jsonb, $6::text::jsonb)",
            &[
                &actor_id,
                &action,
                &target_type,
                &target_id,
                &old_values,
                &new_values,
            ],
        )
        .await
        .map_err(|error| format!("Không thể ghi nhật ký bảo mật: {error}"))?;
    Ok(())
}

fn serialize_audit_value(value: serde_json::Value) -> Result<String, String> {
    serde_json::to_string(&value)
        .map_err(|error| format!("Không thể tạo dữ liệu nhật ký bảo mật: {error}"))
}

async fn verify_bootstrap_token(client: &Client, token: &str) -> Result<(), String> {
    let row = client
        .query_opt(
            "SELECT COALESCE(
                bootstrap_token_hash = encode(digest($1, 'sha256'), 'hex'),
                FALSE
             )
             FROM system_state
             WHERE singleton = 1 AND initialized_at IS NULL",
            &[&token],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra trạng thái bootstrap: {error}"))?;

    match row {
        Some(row) if row.get::<_, bool>(0) => Ok(()),
        _ => Err("Mã bootstrap không hợp lệ hoặc hệ thống đã được thiết lập.".to_string()),
    }
}

async fn load_mail_settings(client: &Client) -> Result<MailSettings, String> {
    let row = client
        .query_opt(
            "SELECT recovery_email, smtp_host, smtp_port, smtp_username
             FROM mail_settings
             WHERE singleton = 1",
            &[],
        )
        .await
        .map_err(|error| format!("Không thể đọc cấu hình email từ database: {error}"))?
        .ok_or_else(|| {
            "Chưa có cấu hình email trong database. Hãy chạy lại database/scripts/init.sh."
                .to_string()
        })?;
    let smtp_port: i32 = row.get("smtp_port");
    let smtp_port = u16::try_from(smtp_port)
        .map_err(|_| "Cổng SMTP trong database không hợp lệ.".to_string())?;
    let credential_entry = Entry::new(MAIL_KEYRING_SERVICE, MAIL_KEYRING_ACCOUNT)
        .map_err(|error| format!("Không thể mở Keychain để đọc mật khẩu SMTP: {error}"))?;
    let smtp_app_password = credential_entry.get_password().map_err(|error| {
        format!("Không tìm thấy mật khẩu SMTP trong Keychain. Hãy chạy lại database/scripts/init.sh: {error}")
    })?;
    let settings = MailSettings {
        recovery_email: row.get("recovery_email"),
        smtp_host: row.get("smtp_host"),
        smtp_port,
        smtp_username: row.get("smtp_username"),
        smtp_app_password,
    };
    validate_mail_settings(&settings)?;
    Ok(settings)
}

async fn connect_to_database(config: &DatabaseConnectionConfig) -> Result<Client, String> {
    let mut postgres_config = PostgresConfig::new();
    postgres_config
        .host(&config.host)
        .port(config.port)
        .dbname(&config.database)
        .user(&config.username)
        .password(&config.password)
        .ssl_mode(if config.use_ssl {
            SslMode::Require
        } else {
            SslMode::Disable
        });

    let native_tls = native_tls::TlsConnector::new()
        .map_err(|error| format!("Không thể khởi tạo kết nối TLS: {error}"))?;
    let (client, connection) = postgres_config
        .connect(MakeTlsConnector::new(native_tls))
        .await
        .map_err(|error| format!("Kết nối PostgreSQL thất bại: {error}"))?;

    tauri::async_runtime::spawn(async move {
        if let Err(error) = connection.await {
            if !error.is_closed() {
                eprintln!("Kết nối PostgreSQL đã đóng bất thường: {error}");
            }
        }
    });

    Ok(client)
}

fn build_otp_email(
    settings: &MailSettings,
    otp: &str,
    purpose: &str,
) -> Result<(SmtpTransport, Message), String> {
    let from = settings
        .smtp_username
        .parse()
        .map_err(|error| format!("Địa chỉ email SMTP không hợp lệ: {error}"))?;
    let to = settings
        .recovery_email
        .parse()
        .map_err(|error| format!("Email khôi phục không hợp lệ: {error}"))?;
    let email = Message::builder()
        .from(from)
        .to(to)
        .subject(format!("Mã xác minh {purpose}"))
        .header(ContentType::TEXT_PLAIN)
        .body(format!(
            "Mã xác minh {purpose} của bạn là {otp}. Mã có hiệu lực trong 5 phút."
        ))
        .map_err(|error| format!("Không thể tạo email xác minh: {error}"))?;
    let password = settings
        .smtp_app_password
        .chars()
        .filter(|character| !character.is_whitespace())
        .collect();
    let mailer = SmtpTransport::starttls_relay(&settings.smtp_host)
        .map_err(|error| format!("Không thể khởi tạo kết nối SMTP: {error}"))?
        .port(settings.smtp_port)
        .credentials(Credentials::new(settings.smtp_username.clone(), password))
        .build();

    Ok((mailer, email))
}

#[tauri::command]
async fn send_admin_setup_otp(
    bootstrap_token: String,
    admin_password: String,
) -> Result<String, String> {
    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    verify_bootstrap_token(&client, &bootstrap_token).await?;
    let mail_settings = load_mail_settings(&client).await?;

    let account = client
        .query_opt(
            "SELECT id::text
             FROM accounts
             WHERE username = 'admin'
               AND person_type = 'SYSTEM'
               AND status = 'SETUP_REQUIRED'
               AND password_hash = crypt($1, password_hash)",
            &[&admin_password],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra tài khoản Admin: {error}"))?
        .ok_or_else(|| {
            "Mật khẩu Admin tạm thời không đúng hoặc tài khoản đã được thiết lập.".to_string()
        })?;
    let account_id: String = account.get(0);

    let recent_otp = client
        .query_opt(
            "SELECT created_at > now() - interval '60 seconds'
             FROM otp_verifications
             WHERE account_id = $1::text::uuid AND purpose = 'SETUP_EMAIL'
             ORDER BY created_at DESC
             LIMIT 1",
            &[&account_id],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra thời gian gửi OTP: {error}"))?;
    if recent_otp.is_some_and(|row| row.get::<_, bool>(0)) {
        return Err("Vui lòng đợi 60 giây trước khi gửi lại mã OTP.".to_string());
    }

    let otp = format!("{:06}", rand::rng().random_range(0..1_000_000));
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu giao dịch OTP: {error}"))?;
    transaction
        .execute(
            "UPDATE accounts
             SET recovery_email = $1, recovery_email_verified_at = NULL, updated_at = now()
             WHERE id = $2::text::uuid",
            &[&mail_settings.recovery_email, &account_id],
        )
        .await
        .map_err(|error| format!("Không thể cập nhật email khôi phục: {error}"))?;
    transaction
        .execute(
            "UPDATE otp_verifications
             SET consumed_at = now()
             WHERE account_id = $1::text::uuid
               AND purpose = 'SETUP_EMAIL'
               AND consumed_at IS NULL",
            &[&account_id],
        )
        .await
        .map_err(|error| format!("Không thể vô hiệu OTP cũ: {error}"))?;
    transaction
        .execute(
            "INSERT INTO otp_verifications (account_id, purpose, otp_hash, expires_at)
             VALUES ($1::text::uuid, 'SETUP_EMAIL', crypt($2, gen_salt('bf', 6)), now() + interval '5 minutes')",
            &[&account_id, &otp],
        )
        .await
        .map_err(|error| format!("Không thể lưu mã OTP: {error}"))?;

    let (mailer, email) = build_otp_email(&mail_settings, &otp, "thiết lập Admin")?;
    tauri::async_runtime::spawn_blocking(move || {
        mailer
            .send(&email)
            .map(|_| ())
            .map_err(|error| format!("Không gửi được email OTP: {error}"))
    })
    .await
    .map_err(|error| format!("Tác vụ gửi email OTP bị lỗi: {error}"))??;

    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất giao dịch OTP: {error}"))?;
    Ok(mail_settings.recovery_email)
}

#[tauri::command]
async fn send_admin_password_reset_otp(username: String) -> Result<String, String> {
    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let mail_settings = load_mail_settings(&client).await?;
    let account = client
        .query_opt(
            "SELECT id::text
             FROM accounts
             WHERE username = lower($1)
               AND person_type = 'SYSTEM'
               AND role = 'ADMIN'
               AND status = 'ACTIVE'
               AND recovery_email_verified_at IS NOT NULL
               AND recovery_email = $2",
            &[&username, &mail_settings.recovery_email],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra tài khoản khôi phục: {error}"))?;

    let Some(account) = account else {
        return Err(
            "Không tìm thấy tài khoản Admin hợp lệ hoặc email khôi phục chưa được xác minh."
                .to_string(),
        );
    };
    let account_id: String = account.get(0);
    let recent_otp = client
        .query_opt(
            "SELECT created_at > now() - interval '60 seconds'
             FROM otp_verifications
             WHERE account_id = $1::text::uuid AND purpose = 'RESET_PASSWORD'
             ORDER BY created_at DESC
             LIMIT 1",
            &[&account_id],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra thời gian gửi OTP: {error}"))?;
    if recent_otp.is_some_and(|row| row.get::<_, bool>(0)) {
        return Err("Vui lòng đợi 60 giây trước khi gửi lại mã OTP.".to_string());
    }

    let otp = format!("{:06}", rand::rng().random_range(0..1_000_000));
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu giao dịch OTP: {error}"))?;
    transaction
        .execute(
            "UPDATE otp_verifications
             SET consumed_at = now()
             WHERE account_id = $1::text::uuid
               AND purpose = 'RESET_PASSWORD'
               AND consumed_at IS NULL",
            &[&account_id],
        )
        .await
        .map_err(|error| format!("Không thể vô hiệu OTP khôi phục cũ: {error}"))?;
    transaction
        .execute(
            "INSERT INTO otp_verifications (account_id, purpose, otp_hash, expires_at)
             VALUES ($1::text::uuid, 'RESET_PASSWORD', crypt($2, gen_salt('bf', 6)), now() + interval '5 minutes')",
            &[&account_id, &otp],
        )
        .await
        .map_err(|error| format!("Không thể lưu OTP khôi phục: {error}"))?;

    let (mailer, email) = build_otp_email(&mail_settings, &otp, "đặt lại mật khẩu Admin")?;
    tauri::async_runtime::spawn_blocking(move || {
        mailer
            .send(&email)
            .map(|_| ())
            .map_err(|error| format!("Không gửi được email OTP: {error}"))
    })
    .await
    .map_err(|error| format!("Tác vụ gửi email OTP bị lỗi: {error}"))??;

    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất giao dịch OTP: {error}"))?;
    Ok(mask_email_address(&mail_settings.recovery_email))
}

#[tauri::command]
async fn verify_admin_password_reset_otp(username: String, otp: String) -> Result<(), String> {
    if otp.len() != 6 || !otp.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err("Mã OTP không đúng hoặc đã hết hạn.".to_string());
    }

    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let mail_settings = load_mail_settings(&client).await?;
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu giao dịch xác minh OTP: {error}"))?;
    let account = transaction
        .query_opt(
            "SELECT id::text
             FROM accounts
             WHERE username = lower($1)
               AND person_type = 'SYSTEM'
               AND role = 'ADMIN'
               AND status = 'ACTIVE'
               AND recovery_email_verified_at IS NOT NULL
               AND recovery_email = $2
             FOR UPDATE",
            &[&username, &mail_settings.recovery_email],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra tài khoản khôi phục: {error}"))?;

    let Some(account) = account else {
        return Err("Mã OTP không đúng hoặc đã hết hạn.".to_string());
    };
    let account_id: String = account.get(0);
    let verification = transaction
        .query_opt(
            "SELECT id::text
             FROM otp_verifications
             WHERE account_id = $1::text::uuid
               AND purpose = 'RESET_PASSWORD'
               AND consumed_at IS NULL
               AND expires_at > now()
               AND attempts < 5
               AND otp_hash = crypt($2, otp_hash)
             ORDER BY created_at DESC
             LIMIT 1
             FOR UPDATE",
            &[&account_id, &otp],
        )
        .await
        .map_err(|error| format!("Không thể xác minh OTP đặt lại mật khẩu: {error}"))?;

    if verification.is_none() {
        transaction
            .execute(
                "UPDATE otp_verifications
                 SET attempts = attempts + 1
                 WHERE id = (
                     SELECT id FROM otp_verifications
                     WHERE account_id = $1::text::uuid
                       AND purpose = 'RESET_PASSWORD'
                       AND consumed_at IS NULL
                       AND expires_at > now()
                       AND attempts < 5
                     ORDER BY created_at DESC
                     LIMIT 1
                 )",
                &[&account_id],
            )
            .await
            .map_err(|error| format!("Không thể ghi nhận lần thử OTP: {error}"))?;
        transaction
            .commit()
            .await
            .map_err(|error| format!("Không thể hoàn tất giao dịch OTP: {error}"))?;
        return Err("Mã OTP không đúng hoặc đã hết hạn.".to_string());
    }

    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất giao dịch xác minh OTP: {error}"))?;
    Ok(())
}

#[tauri::command]
async fn reset_admin_password(
    username: String,
    otp: String,
    new_password: String,
) -> Result<(), String> {
    validate_new_admin_password(&new_password)?;
    if otp.len() != 6 || !otp.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err("Mã OTP không đúng hoặc đã hết hạn.".to_string());
    }

    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let mail_settings = load_mail_settings(&client).await?;
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu giao dịch đặt lại mật khẩu: {error}"))?;
    let account = transaction
        .query_opt(
            "SELECT id::text
             FROM accounts
             WHERE username = lower($1)
               AND person_type = 'SYSTEM'
               AND role = 'ADMIN'
               AND status = 'ACTIVE'
               AND recovery_email_verified_at IS NOT NULL
               AND recovery_email = $2
             FOR UPDATE",
            &[&username, &mail_settings.recovery_email],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra tài khoản khôi phục: {error}"))?;

    let Some(account) = account else {
        return Err("Mã OTP không đúng hoặc đã hết hạn.".to_string());
    };
    let account_id: String = account.get(0);
    let verification = transaction
        .query_opt(
            "SELECT id::text
             FROM otp_verifications
             WHERE account_id = $1::text::uuid
               AND purpose = 'RESET_PASSWORD'
               AND consumed_at IS NULL
               AND expires_at > now()
               AND attempts < 5
               AND otp_hash = crypt($2, otp_hash)
             ORDER BY created_at DESC
             LIMIT 1
             FOR UPDATE",
            &[&account_id, &otp],
        )
        .await
        .map_err(|error| format!("Không thể xác minh OTP đặt lại mật khẩu: {error}"))?;

    let Some(verification) = verification else {
        transaction
            .execute(
                "UPDATE otp_verifications
                 SET attempts = attempts + 1
                 WHERE id = (
                     SELECT id FROM otp_verifications
                     WHERE account_id = $1::text::uuid
                       AND purpose = 'RESET_PASSWORD'
                       AND consumed_at IS NULL
                       AND expires_at > now()
                       AND attempts < 5
                     ORDER BY created_at DESC
                     LIMIT 1
                 )",
                &[&account_id],
            )
            .await
            .map_err(|error| format!("Không thể ghi nhận lần thử OTP: {error}"))?;
        transaction
            .commit()
            .await
            .map_err(|error| format!("Không thể hoàn tất giao dịch OTP: {error}"))?;
        return Err("Mã OTP không đúng hoặc đã hết hạn.".to_string());
    };

    let verification_id: String = verification.get(0);
    transaction
        .execute(
            "UPDATE accounts
             SET password_hash = crypt($1, gen_salt('bf', 12)), updated_at = now()
             WHERE id = $2::text::uuid",
            &[&new_password, &account_id],
        )
        .await
        .map_err(|error| format!("Không thể cập nhật mật khẩu Admin: {error}"))?;
    transaction
        .execute(
            "UPDATE otp_verifications
             SET consumed_at = now()
             WHERE id = $1::text::uuid
                OR (account_id = $2::text::uuid
                    AND purpose = 'RESET_PASSWORD'
                    AND consumed_at IS NULL)",
            &[&verification_id, &account_id],
        )
        .await
        .map_err(|error| format!("Không thể vô hiệu hóa OTP khôi phục: {error}"))?;
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất giao dịch đặt lại mật khẩu: {error}"))?;
    Ok(())
}

#[tauri::command]
async fn verify_admin_setup_otp(bootstrap_token: String, otp: String) -> Result<(), String> {
    if otp.len() != 6 || !otp.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err("Mã OTP phải gồm 6 chữ số.".to_string());
    }
    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    verify_bootstrap_token(&client, &bootstrap_token).await?;
    let mail_settings = load_mail_settings(&client).await?;

    let account = client
        .query_opt(
            "SELECT id::text
             FROM accounts
             WHERE username = 'admin'
               AND person_type = 'SYSTEM'
               AND status = 'SETUP_REQUIRED'",
            &[],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra trạng thái Admin: {error}"))?
        .ok_or_else(|| "Tài khoản Admin đã được thiết lập hoặc không tồn tại.".to_string())?;
    let account_id: String = account.get(0);
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu giao dịch xác minh OTP: {error}"))?;
    let verified = transaction
        .query_opt(
            "SELECT id::text
             FROM otp_verifications
             WHERE account_id = $1::text::uuid
               AND purpose = 'SETUP_EMAIL'
               AND consumed_at IS NULL
               AND expires_at > now()
               AND attempts < 5
               AND otp_hash = crypt($2, otp_hash)
             ORDER BY created_at DESC
             LIMIT 1",
            &[&account_id, &otp],
        )
        .await
        .map_err(|error| format!("Không thể xác minh mã OTP: {error}"))?;

    let Some(verification) = verified else {
        let changed = transaction
            .execute(
                "UPDATE otp_verifications
                 SET attempts = attempts + 1
                 WHERE id = (
                     SELECT id FROM otp_verifications
                     WHERE account_id = $1::text::uuid
                       AND purpose = 'SETUP_EMAIL'
                       AND consumed_at IS NULL
                       AND expires_at > now()
                       AND attempts < 5
                     ORDER BY created_at DESC
                     LIMIT 1
                 )",
                &[&account_id],
            )
            .await
            .map_err(|error| format!("Không thể ghi nhận lần thử OTP: {error}"))?;
        transaction
            .commit()
            .await
            .map_err(|error| format!("Không thể hoàn tất giao dịch OTP: {error}"))?;
        return Err(if changed == 0 {
            "Mã OTP đã hết hạn hoặc vượt quá số lần nhập.".to_string()
        } else {
            "Mã OTP không đúng.".to_string()
        });
    };

    let verification_id: String = verification.get(0);
    transaction
        .execute(
            "UPDATE otp_verifications SET consumed_at = now() WHERE id = $1::text::uuid",
            &[&verification_id],
        )
        .await
        .map_err(|error| format!("Không thể đánh dấu OTP đã sử dụng: {error}"))?;
    transaction
        .execute(
            "UPDATE accounts
             SET recovery_email = $1, recovery_email_verified_at = now(), updated_at = now()
             WHERE id = $2::text::uuid",
            &[&mail_settings.recovery_email, &account_id],
        )
        .await
        .map_err(|error| format!("Không thể xác nhận email khôi phục: {error}"))?;
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất xác minh email: {error}"))?;
    Ok(())
}

#[tauri::command]
async fn complete_admin_setup(bootstrap_token: String, new_password: String) -> Result<(), String> {
    validate_new_admin_password(&new_password)?;
    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    verify_bootstrap_token(&client, &bootstrap_token).await?;

    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu giao dịch kích hoạt Admin: {error}"))?;
    let updated = transaction
        .execute(
            "UPDATE accounts
             SET password_hash = crypt($1, gen_salt('bf', 12)),
                 status = 'ACTIVE',
                 setup_completed_at = now(),
                 updated_at = now()
             WHERE username = 'admin'
               AND person_type = 'SYSTEM'
               AND status = 'SETUP_REQUIRED'
               AND recovery_email_verified_at IS NOT NULL",
            &[&new_password],
        )
        .await
        .map_err(|error| format!("Không thể cập nhật tài khoản Admin: {error}"))?;
    if updated != 1 {
        return Err("Cần xác minh email trước khi đổi mật khẩu Admin.".to_string());
    }
    let initialized = transaction
        .execute(
            "UPDATE system_state
             SET initialized_at = now(), bootstrap_token_hash = NULL
             WHERE singleton = 1 AND initialized_at IS NULL",
            &[],
        )
        .await
        .map_err(|error| format!("Không thể hoàn tất trạng thái bootstrap: {error}"))?;
    if initialized != 1 {
        return Err(
            "Hệ thống đã được thiết lập hoặc trạng thái bootstrap không hợp lệ.".to_string(),
        );
    }
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất giao dịch kích hoạt Admin: {error}"))?;
    Ok(())
}

#[tauri::command]
fn get_database_configuration_status() -> Result<bool, String> {
    Ok(read_saved_config()?.is_some())
}

#[tauri::command]
async fn get_admin_setup_required() -> Result<bool, String> {
    let Some(config) = read_saved_config()? else {
        return Ok(false);
    };
    let client = connect_to_database(&config).await?;
    let row = client
        .query_opt(
            "SELECT status = 'SETUP_REQUIRED'
             FROM accounts
             WHERE username = 'admin' AND person_type = 'SYSTEM'",
            &[],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra trạng thái thiết lập Admin: {error}"))?;

    Ok(row.is_some_and(|row| row.get::<_, bool>(0)))
}

#[tauri::command]
async fn configure_database(config: DatabaseConnectionConfig) -> Result<(), String> {
    validate_config(&config)?;
    let client = connect_to_database(&config).await?;
    client
        .simple_query("SELECT 1")
        .await
        .map_err(|error| format!("Đã kết nối nhưng không kiểm tra được database: {error}"))?;

    let serialized = serde_json::to_string(&config)
        .map_err(|error| format!("Không thể mã hóa cấu hình database: {error}"))?;
    let entry = connection_entry()?;
    entry
        .set_password(&serialized)
        .map_err(|error| format!("Không thể lưu cấu hình vào kho bảo mật: {error}"))?;

    match entry.get_password() {
        Ok(saved) if saved == serialized => {}
        Ok(_) => {
            return Err(
                "Cấu hình lưu trong kho bảo mật không khớp với cấu hình vừa nhập.".to_string(),
            );
        }
        Err(error) => {
            return Err(format!("Không đọc lại được cấu hình vừa lưu: {error}"));
        }
    }

    Ok(())
}

#[tauri::command]
async fn list_staff_profiles(actor_username: String) -> Result<Vec<StaffProfile>, String> {
    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu truy vấn cán bộ: {error}"))?;
    require_admin(&transaction, &actor_username).await?;
    let rows = transaction
        .query(
            "SELECT
                staff_profiles.staff_code,
                staff_profiles.full_name,
                staff_profiles.email,
                staff_profiles.phone_number,
                linked_account.username AS account_username,
                linked_account.role AS account_role,
                linked_account.status AS account_status
             FROM staff_profiles
             LEFT JOIN LATERAL (
                SELECT username, role, status
                FROM accounts
                WHERE person_type = 'STAFF'
                  AND person_code = staff_profiles.staff_code
                ORDER BY created_at DESC
                LIMIT 1
             ) AS linked_account ON TRUE
             ORDER BY staff_profiles.staff_code",
            &[],
        )
        .await
        .map_err(|error| format!("Không thể tải danh sách cán bộ trường: {error}"))?;
    let profiles = rows
        .into_iter()
        .map(|row| StaffProfile {
            staff_code: row.get("staff_code"),
            full_name: row.get("full_name"),
            email: row.get("email"),
            phone_number: row.get("phone_number"),
            account_username: row.get("account_username"),
            account_role: row.get("account_role"),
            account_status: row.get("account_status"),
        })
        .collect();
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất truy vấn cán bộ: {error}"))?;
    Ok(profiles)
}

#[tauri::command]
async fn create_staff_profile(
    actor_username: String,
    full_name: String,
    email: Option<String>,
    phone_number: Option<String>,
) -> Result<StaffProfile, String> {
    let full_name = full_name.trim().to_string();
    if full_name.is_empty() || full_name.chars().count() > 150 {
        return Err("Họ tên cán bộ là bắt buộc và tối đa 150 ký tự.".to_string());
    }
    let email = normalize_optional(email);
    let phone_number = normalize_optional(phone_number);
    if email.as_ref().is_some_and(|email| !email.contains('@')) {
        return Err("Email cán bộ không hợp lệ.".to_string());
    }

    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu tạo hồ sơ cán bộ: {error}"))?;
    let actor_id = require_admin(&transaction, &actor_username).await?;
    let row = transaction
        .query_one(
            "INSERT INTO staff_profiles (full_name, email, phone_number)
             VALUES ($1, $2, $3)
             RETURNING staff_code, full_name, email, phone_number",
            &[&full_name, &email, &phone_number],
        )
        .await
        .map_err(|error| format!("Không thể tạo hồ sơ cán bộ trường: {error}"))?;
    let profile = StaffProfile {
        staff_code: row.get("staff_code"),
        full_name: row.get("full_name"),
        email: row.get("email"),
        phone_number: row.get("phone_number"),
        account_username: None,
        account_role: None,
        account_status: None,
    };
    let new_values = serialize_audit_value(serde_json::json!({
        "staffCode": profile.staff_code,
        "fullName": profile.full_name,
        "email": profile.email,
        "phoneNumber": profile.phone_number
    }))?;
    record_security_audit(
        &transaction,
        &actor_id,
        "STAFF_PROFILE_CREATED",
        "STAFF_PROFILE",
        &profile.staff_code,
        None,
        Some(new_values),
    )
    .await?;
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất tạo hồ sơ cán bộ: {error}"))?;
    Ok(profile)
}

#[tauri::command]
async fn list_managed_accounts(actor_username: String) -> Result<Vec<ManagedAccount>, String> {
    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu truy vấn tài khoản: {error}"))?;
    require_admin(&transaction, &actor_username).await?;
    let rows = transaction
        .query(
            "SELECT
                accounts.id::text,
                accounts.username,
                accounts.person_type,
                accounts.person_code,
                COALESCE(staff_profiles.full_name, students.full_name) AS person_name,
                accounts.role,
                accounts.status
             FROM accounts
             LEFT JOIN staff_profiles
               ON accounts.person_type = 'STAFF'
              AND accounts.person_code = staff_profiles.staff_code
             LEFT JOIN students
               ON accounts.person_type = 'STUDENT'
              AND accounts.person_code = students.mssv
             WHERE accounts.person_type <> 'SYSTEM'
               AND accounts.role <> 'ADMIN'
             ORDER BY accounts.role, accounts.username",
            &[],
        )
        .await
        .map_err(|error| format!("Không thể tải danh sách tài khoản: {error}"))?;
    let accounts = rows
        .into_iter()
        .map(|row| ManagedAccount {
            id: row.get("id"),
            username: row.get("username"),
            person_type: row.get("person_type"),
            person_code: row.get("person_code"),
            person_name: row.get("person_name"),
            role: row.get("role"),
            status: row.get("status"),
        })
        .collect();
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất truy vấn tài khoản: {error}"))?;
    Ok(accounts)
}

#[tauri::command]
async fn appoint_secretary(
    actor_username: String,
    staff_code: String,
    username: String,
    password: String,
) -> Result<(), String> {
    validate_account_password(&password)?;
    let username = username.trim().to_lowercase();
    if username.is_empty()
        || username.chars().count() > 100
        || username.chars().any(char::is_whitespace)
    {
        return Err("Username phải có từ 1 đến 100 ký tự và không chứa khoảng trắng.".to_string());
    }

    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu bổ nhiệm Bí thư: {error}"))?;
    let actor_id = require_admin(&transaction, &actor_username).await?;
    let staff = transaction
        .query_opt(
            "SELECT full_name
             FROM staff_profiles
             WHERE staff_code = $1 AND is_active = TRUE
             FOR UPDATE",
            &[&staff_code],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra hồ sơ cán bộ: {error}"))?
        .ok_or_else(|| "Không tìm thấy hồ sơ cán bộ đang hoạt động.".to_string())?;
    let staff_name: String = staff.get(0);

    let target_accounts = transaction
        .query(
            "SELECT id::text, username, role, status
             FROM accounts
             WHERE person_type = 'STAFF' AND person_code = $1
             FOR UPDATE",
            &[&staff_code],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra tài khoản cán bộ: {error}"))?;
    if target_accounts.len() > 1 {
        return Err(
            "Cán bộ đang liên kết nhiều tài khoản; cần xử lý dữ liệu trùng trước.".to_string(),
        );
    }
    let target_account = target_accounts.first();
    let target_account_id: Option<String> = target_account.map(|row| row.get(0));
    let target_old_username: Option<String> = target_account.map(|row| row.get(1));
    let target_old_role: Option<String> = target_account.map(|row| row.get(2));
    let target_old_status: Option<String> = target_account.map(|row| row.get(3));

    let username_owner = transaction
        .query_opt(
            "SELECT id::text FROM accounts WHERE lower(username) = lower($1)",
            &[&username],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra username: {error}"))?;
    if username_owner.is_some_and(|row| {
        let owner_id: String = row.get(0);
        target_account_id.as_deref() != Some(owner_id.as_str())
    }) {
        return Err("Username đã được sử dụng.".to_string());
    }

    let current_secretary = transaction
        .query_opt(
            "SELECT id::text, username, person_code
             FROM accounts
             WHERE role = 'SECRETARY' AND status = 'ACTIVE'
             FOR UPDATE",
            &[],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra Bí thư hiện tại: {error}"))?;
    if current_secretary.as_ref().is_some_and(|row| {
        let current_id: String = row.get(0);
        target_account_id.as_deref() == Some(current_id.as_str())
    }) {
        return Err("Cán bộ này hiện đang giữ vai trò Bí thư.".to_string());
    }

    let previous_secretary = current_secretary.as_ref().map(|row| {
        serde_json::json!({
            "accountId": row.get::<_, String>(0),
            "username": row.get::<_, String>(1),
            "staffCode": row.get::<_, Option<String>>(2),
            "status": "ACTIVE"
        })
    });
    if let Some(row) = current_secretary.as_ref() {
        let current_id: String = row.get(0);
        transaction
            .execute(
                "UPDATE accounts SET status = 'DISABLED', updated_at = now()
                 WHERE id = $1::text::uuid",
                &[&current_id],
            )
            .await
            .map_err(|error| format!("Không thể khóa tài khoản Bí thư cũ: {error}"))?;
    }

    let target_account_id = if let Some(account_id) = target_account_id {
        transaction
            .execute(
                "UPDATE accounts
                 SET username = $1,
                     password_hash = crypt($2, gen_salt('bf', 12)),
                     role = 'SECRETARY',
                     status = 'ACTIVE',
                     updated_at = now()
                 WHERE id = $3::text::uuid",
                &[&username, &password, &account_id],
            )
            .await
            .map_err(|error| format!("Không thể cấp tài khoản Bí thư: {error}"))?;
        account_id
    } else {
        let account = transaction
            .query_one(
                "INSERT INTO accounts (
                    username, password_hash, person_type, person_code, role, status
                 )
                 VALUES ($1, crypt($2, gen_salt('bf', 12)), 'STAFF', $3, 'SECRETARY', 'ACTIVE')
                 RETURNING id::text",
                &[&username, &password, &staff_code],
            )
            .await
            .map_err(|error| format!("Không thể tạo tài khoản Bí thư: {error}"))?;
        account.get(0)
    };

    let old_values = serialize_audit_value(serde_json::json!({
        "previousSecretary": previous_secretary,
        "targetAccount": {
            "username": target_old_username,
            "role": target_old_role,
            "status": target_old_status
        }
    }))?;
    let new_values = serialize_audit_value(serde_json::json!({
        "staffCode": staff_code,
        "staffName": staff_name,
        "accountId": target_account_id,
        "username": username,
        "role": "SECRETARY",
        "status": "ACTIVE",
        "previousSecretaryDisabled": current_secretary.is_some()
    }))?;
    record_security_audit(
        &transaction,
        &actor_id,
        "SECRETARY_ASSIGNED",
        "STAFF_PROFILE",
        &staff_code,
        Some(old_values),
        Some(new_values),
    )
    .await?;
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất bổ nhiệm Bí thư: {error}"))?;
    Ok(())
}

#[tauri::command]
async fn set_managed_account_password(
    actor_username: String,
    account_id: String,
    new_password: String,
) -> Result<(), String> {
    validate_account_password(&new_password)?;
    let config =
        read_saved_config()?.ok_or_else(|| "Chưa cấu hình kết nối database.".to_string())?;
    let mut client = connect_to_database(&config).await?;
    let transaction = client
        .transaction()
        .await
        .map_err(|error| format!("Không thể bắt đầu cập nhật mật khẩu: {error}"))?;
    let actor_id = require_admin(&transaction, &actor_username).await?;
    let target = transaction
        .query_opt(
            "SELECT username, role, person_type, status
             FROM accounts
             WHERE id = $1::text::uuid
             FOR UPDATE",
            &[&account_id],
        )
        .await
        .map_err(|error| format!("Không thể kiểm tra tài khoản cần cập nhật: {error}"))?
        .ok_or_else(|| "Không tìm thấy tài khoản.".to_string())?;
    let username: String = target.get("username");
    let role: String = target.get("role");
    let person_type: String = target.get("person_type");
    let status: String = target.get("status");
    if person_type == "SYSTEM" || role == "ADMIN" {
        return Err("Admin không được thay đổi mật khẩu tài khoản Admin.".to_string());
    }
    if account_id == actor_id {
        return Err("Admin không được tự quản lý mật khẩu của mình tại màn hình này.".to_string());
    }

    transaction
        .execute(
            "UPDATE accounts
             SET password_hash = crypt($1, gen_salt('bf', 12)), updated_at = now()
             WHERE id = $2::text::uuid",
            &[&new_password, &account_id],
        )
        .await
        .map_err(|error| format!("Không thể cập nhật mật khẩu tài khoản: {error}"))?;
    let new_values = serialize_audit_value(serde_json::json!({
        "username": username,
        "role": role,
        "status": status,
        "passwordUpdated": true
    }))?;
    let old_values = serialize_audit_value(serde_json::json!({
        "username": username,
        "role": role,
        "status": status,
        "passwordUpdated": false
    }))?;
    record_security_audit(
        &transaction,
        &actor_id,
        "ACCOUNT_PASSWORD_RESET",
        "ACCOUNT",
        &account_id,
        Some(old_values),
        Some(new_values),
    )
    .await?;
    transaction
        .commit()
        .await
        .map_err(|error| format!("Không thể hoàn tất cập nhật mật khẩu: {error}"))?;
    Ok(())
}

#[tauri::command]
async fn authenticate_account(
    username: String,
    password: String,
) -> Result<AuthenticatedAccount, String> {
    let config = read_saved_config()?.ok_or_else(|| {
        "Chưa tìm thấy cấu hình database trong kho bảo mật. Hãy đặt lại và lưu cấu hình kết nối.".to_string()
    })?;
    let client = connect_to_database(&config).await?;
    let row = client
        .query_opt(
            "SELECT username, role, status, password_hash = crypt($1, password_hash) AS password_matches
             FROM accounts
             WHERE username = lower($2)",
            &[&password, &username],
        )
        .await
        .map_err(|error| format!("Không thể xác thực tài khoản: {error}"))?;

    let Some(row) = row else {
        return Err("Tên đăng nhập hoặc mật khẩu không đúng.".to_string());
    };
    let password_matches: bool = row.get("password_matches");
    let status: String = row.get("status");
    if !password_matches || status == "DISABLED" {
        return Err("Tên đăng nhập hoặc mật khẩu không đúng.".to_string());
    }
    if status == "SETUP_REQUIRED" {
        return Err("SETUP_REQUIRED".to_string());
    }
    if status != "ACTIVE" {
        return Err("Trạng thái tài khoản không hợp lệ.".to_string());
    }

    Ok(AuthenticatedAccount {
        username: row.get("username"),
        role: row.get("role"),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_database_configuration_status,
            get_admin_setup_required,
            configure_database,
            send_admin_setup_otp,
            send_admin_password_reset_otp,
            verify_admin_password_reset_otp,
            reset_admin_password,
            verify_admin_setup_otp,
            complete_admin_setup,
            list_staff_profiles,
            create_staff_profile,
            list_managed_accounts,
            appoint_secretary,
            set_managed_account_password,
            authenticate_account
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mail_settings_require_valid_email_smtp_host_and_password() {
        let valid = MailSettings {
            recovery_email: "admin@example.com".to_string(),
            smtp_host: "smtp.example.com".to_string(),
            smtp_port: 587,
            smtp_username: "admin@example.com".to_string(),
            smtp_app_password: "test-app-password".to_string(),
        };
        assert!(validate_mail_settings(&valid).is_ok());

        let mut missing_password = valid;
        missing_password.smtp_app_password.clear();
        assert!(validate_mail_settings(&missing_password).is_err());
    }

    #[test]
    fn admin_password_must_be_strong_and_different_from_the_temporary_password() {
        assert!(validate_new_admin_password("admin123").is_err());
        assert!(validate_new_admin_password("short1!").is_err());
        assert!(validate_new_admin_password("StrongNewPass1!").is_ok());
    }

    #[test]
    fn managed_account_passwords_must_meet_strength_requirements() {
        assert!(validate_account_password("short1!").is_err());
        assert!(validate_account_password("StrongNewPass1!").is_ok());
    }

    #[test]
    fn masks_email_local_part_and_preserves_domain() {
        assert_eq!(mask_email_address("take55@gmail.com"), "tak***5@gmail.com");
        assert_eq!(mask_email_address("ab@example.com"), "ab***b@example.com");
    }
}
