use keyring::Entry;
use std::io::{self, Read};

const KEYRING_SERVICE: &str = "com.nguyenminhvu.app.mail";
const KEYRING_ACCOUNT: &str = "smtp_app_password";

fn main() -> Result<(), String> {
    let mut password = String::new();
    io::stdin()
        .read_to_string(&mut password)
        .map_err(|error| format!("Không đọc được mật khẩu SMTP: {error}"))?;
    let password = password.trim();
    if password.is_empty() {
        return Err("Mật khẩu SMTP không được để trống.".to_string());
    }

    let entry = Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
        .map_err(|error| format!("Không thể mở kho mật khẩu của hệ điều hành: {error}"))?;
    entry
        .set_password(password)
        .map_err(|error| format!("Không thể lưu mật khẩu SMTP vào Keychain: {error}"))?;
    if entry
        .get_password()
        .map_err(|error| format!("Không thể xác nhận mật khẩu SMTP trong Keychain: {error}"))?
        != password
    {
        return Err("Mật khẩu SMTP trong Keychain không khớp sau khi lưu.".to_string());
    }

    println!("Đã lưu mật khẩu SMTP vào Keychain.");
    Ok(())
}
