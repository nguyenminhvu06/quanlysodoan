# Quản lý Sổ Đoàn Viên

## Chạy ứng dụng local

Từ thư mục gốc của dự án, mở Docker Desktop rồi khởi tạo PostgreSQL và schema:

```bash
bash database/scripts/start.sh
bash database/scripts/init.sh
bash database/scripts/insert.sh
```

`insert.sh` chỉ nạp khi bảng `students` đang trống. Mật khẩu PostgreSQL mặc định trong Compose
chỉ dành cho local: database `quan_ly_so_doan`, username `sa`, password `sapassword`.
Để xóa database, chạy `bash database/scripts/drop.sh` và nhập `DROP` để xác nhận.

Sau khi máy khởi động lại, nếu PostgreSQL chưa tự chạy cùng Docker Desktop:

```bash
bash database/scripts/start.sh
```

`start.sh` chỉ bật dịch vụ PostgreSQL; không tạo lại schema hoặc nạp lại sinh viên.
Khi cập nhật ứng dụng trên database đã có, chạy `bash database/scripts/migrate.sh` để thêm/cập nhật
schema mà không chạy lại phần cấu hình SMTP của `init.sh`.

## Thiết lập Admin lần đầu

Chạy `bash database/scripts/init.sh` một lần. Script hỏi email nhận OTP, tài khoản Gmail gửi OTP,
máy chủ/cổng SMTP và mật khẩu ứng dụng email (nhập ẩn). Email và thông tin SMTP không bí mật được
lưu trong database; mật khẩu ứng dụng được lưu trong Keychain của hệ điều hành. Token bootstrap
hiển thị trên terminal một lần; giữ lại để nhập trong app.

Trong app chỉ cần cấu hình kết nối database. Màn hình thiết lập Admin yêu cầu token bootstrap và
mật khẩu tạm `admin123`; sau đó nhận OTP qua email, xác minh rồi đặt mật khẩu mới (ít nhất 12 ký tự,
có chữ hoa, chữ thường, số và ký tự đặc biệt). OTP hết hạn sau 5 phút và giới hạn 5 lần nhập. Khi
hoàn tất, token bootstrap bị vô hiệu hóa.

Không có file bootstrap để chọn. File `configs/bootstrap.config.json` cũ, nếu còn từ luồng trước,
không còn được dùng và có thể xóa sau khi thiết lập mới thành công. Database không chứa mật khẩu ứng
dụng email; mật khẩu nằm trong Keychain cùng tài khoản hệ điều hành dùng để chạy app. Hãy bảo vệ tài
khoản máy tính và quyền truy cập database. Mật khẩu ứng dụng Gmail đã từng được chia sẻ cần được
thu hồi và thay mới.

## Đặt lại mật khẩu Admin

Tại màn hình đăng nhập, chọn **Quên mật khẩu?**, nhập username Admin và yêu cầu OTP. Mã được gửi
đến email khôi phục đã xác minh, có hiệu lực 5 phút, tối đa 5 lần nhập và chỉ gửi lại sau 60 giây.
Nhập OTP cùng mật khẩu mới (ít nhất 12 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt). OTP
chỉ dùng một lần; khi đổi mật khẩu thành công, các OTP đặt lại còn hiệu lực đều bị vô hiệu hóa.
Ứng dụng kiểm tra tài khoản Admin và email khôi phục đã xác minh trước khi gửi; giao diện chỉ hiển
thị email đã che.

## Trang chủ Admin: cán bộ và tài khoản

Database mới tạo bằng `init.sh` đã có bảng `staff_profiles` và nhật ký bảo mật. Với database đã có,
chạy `bash database/scripts/migrate.sh` trước khi mở các màn hình quản trị mới.
Migration chỉ gỡ các cột `unit`/`title` cũ khi chúng không có dữ liệu; nếu có dữ liệu, script dừng để
tránh xóa thông tin.

Admin tạo hồ sơ cán bộ trường trước (mã nội bộ tự sinh; họ tên bắt buộc, email và số điện thoại
tùy chọn), sau đó chọn hồ sơ để cấp tài khoản Bí thư Đoàn khoa. Khi thay Bí thư, tài khoản
Bí thư cũ được khóa và giữ lại lịch sử. Admin có thể đặt lại mật khẩu các tài khoản nghiệp vụ nhưng
không thể thao tác trên tài khoản Admin của chính mình; mật khẩu chỉ lưu dạng hash và không hiển thị
lại.

Menu và trang tổng quan dùng chung layout nhưng thay đổi theo role. Các module đoàn viên, tài khoản
Cán bộ Đoàn và nghiệp vụ sổ sẽ được triển khai tiếp theo theo phạm vi SRS.

Sau đó từ thư mục `app/`:

```bash
npm install
npm run tauri dev
```

Lần đầu mở ứng dụng sẽ hiện form cấu hình kết nối PostgreSQL. Cấu hình được kiểm tra trước khi lưu
vào kho thông tin xác thực của hệ điều hành; giao diện chỉ cho biết đã cấu hình, không đọc lại thông
tin đã lưu. Muốn đổi kết nối, chọn **Đặt lại cấu hình kết nối** để mở form trống. Cấu hình cũ vẫn
được giữ lại cho đến khi kết nối bằng thông tin mới thành công; nếu đóng app trước khi lưu thành
công, lần mở tiếp theo vẫn dùng cấu hình cũ.
# quanlysodoan
