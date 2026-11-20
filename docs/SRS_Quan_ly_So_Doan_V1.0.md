# TÀI LIỆU ĐẶC TẢ YÊU CẦU NGHIỆP VỤ

## HỆ THỐNG QUẢN LÝ SỔ ĐOÀN VIÊN

Đoàn khoa • Phiên bản 1.0

**BUSINESS REQUIREMENTS & SOFTWARE REQUIREMENTS SPECIFICATION**

| **THÔNG TIN TÀI LIỆU** | **GIÁ TRỊ**                                                          |
|------------------------|----------------------------------------------------------------------|
| Mã tài liệu            | SRS-SD-1.0                                                           |
| Phiên bản              | 1.0 – Bản dự thảo tổng hợp                                           |
| Ngày lập               | 18/11/2026                                                           |
| Tình trạng             | Chờ xác nhận các điểm còn mở                                         |
| Phạm vi                | Quản lý hồ sơ đoàn viên, sổ vật lý, tài khoản và nghiệp vụ văn phòng |
| Đơn vị sử dụng         | Đoàn khoa                                                            |

Tài liệu phục vụ thống nhất nghiệp vụ trước khi thiết kế cơ sở dữ liệu, API và giao diện.

# THÔNG TIN KIỂM SOÁT TÀI LIỆU

| **Mục**             | **Nội dung**                                                                                                   |
|---------------------|----------------------------------------------------------------------------------------------------------------|
| Mục đích            | Là căn cứ xác nhận phạm vi, tác nhân, quyền truy cập, dữ liệu, quy trình và tiêu chí nghiệm thu của V1.0.      |
| Đối tượng đọc       | Đơn vị nghiệp vụ Đoàn khoa; nhóm phân tích; nhóm thiết kế UX/UI; nhóm backend/frontend; nhóm kiểm thử.         |
| Nguồn yêu cầu       | Tổng hợp từ các quyết định nghiệp vụ đã được trao đổi đến ngày 18/11/2026.                                     |
| Quy ước             | \[CHỐT\] yêu cầu đã thống nhất; \[ĐỀ XUẤT\] giải pháp kỹ thuật; \[CHỜ XÁC NHẬN\] điểm chưa quyết định.         |
| Nguyên tắc thay đổi | Mọi thay đổi yêu cầu phải cập nhật mã quy tắc, phiên bản tài liệu và tác động tới use case, dữ liệu, kiểm thử. |

## Lịch sử phiên bản

| **Phiên bản** | **Ngày**   | **Nội dung**                                                             | **Trạng thái** |
|---------------|------------|--------------------------------------------------------------------------|----------------|
| 1.0-draft     | 18/11/2026 | Tổng hợp đặc tả nghiệp vụ, sơ đồ luồng, sequence, dữ liệu, quyền và OTP. | Chờ rà soát    |

## Danh mục sơ đồ

| **Mã**  | **Sơ đồ**                                 |
|---------|-------------------------------------------|
| H01     | Bối cảnh và nhóm dữ liệu hệ thống         |
| H02     | Máy trạng thái sổ Đoàn                    |
| H03     | Flow tiếp nhận sổ                         |
| H04     | Flow cho mượn sổ                          |
| H05     | Flow nhận trả sổ                          |
| H06     | Flow import Excel                         |
| H07     | Flow khởi tạo Admin                       |
| H08     | Sơ đồ liên kết dữ liệu logic              |
| H09–H10 | Sequence mượn và trả sổ                   |
| H11–H12 | Sequence kích hoạt Admin và khôi phục OTP |
| H13     | Sequence Bí thư tạo tài khoản Cán bộ Đoàn |

# MỤC LỤC

- [1. GIỚI THIỆU VÀ PHẠM VI](#1-giới-thiệu-và-phạm-vi)
- [2. NGỮ CẢNH, TÁC NHÂN VÀ NGUYÊN TẮC](#2-ngữ-cảnh-tác-nhân-và-nguyên-tắc)
- [3. QUẢN LÝ VAI TRÒ VÀ PHÂN QUYỀN](#3-quản-lý-vai-trò-và-phân-quyền)
- [4. HỒ SƠ ĐOÀN VIÊN, LỚP VÀ NHÂN SỰ TRƯỜNG](#4-hồ-sơ-đoàn-viên-lớp-và-nhân-sự-trường)
- [5. QUẢN LÝ TÀI KHOẢN VÀ LIÊN KẾT ĐỊNH DANH](#5-quản-lý-tài-khoản-và-liên-kết-định-danh)
- [6. ADMIN GỐC, OTP VÀ KHÔI PHỤC](#6-admin-gốc-otp-và-khôi-phục)
- [7. QUẢN LÝ SỔ ĐOÀN VÀ GIAO DỊCH VẬT LÝ](#7-quản-lý-sổ-đoàn-và-giao-dịch-vật-lý)
- [8. TRA CỨU, IMPORT EXCEL VÀ BÁO CÁO](#8-tra-cứu-import-excel-và-báo-cáo)
- [9. DANH MỤC YÊU CẦU CHỨC NĂNG](#9-danh-mục-yêu-cầu-chức-năng)
- [10. ĐẶC TẢ USE CASE TRỌNG TÂM](#10-đặc-tả-use-case-trọng-tâm)
- [11. MÔ HÌNH DỮ LIỆU LOGIC](#11-mô-hình-dữ-liệu-logic)
- [12. QUY TẮC DỮ LIỆU, KIỂM SOÁT VÀ NHẬT KÝ](#12-quy-tắc-dữ-liệu-kiểm-soát-và-nhật-ký)
- [13. YÊU CẦU PHI CHỨC NĂNG](#13-yêu-cầu-phi-chức-năng)
- [14. KỊCH BẢN KIỂM THỬ NGHIỆM THU](#14-kịch-bản-kiểm-thử-nghiệm-thu)
- [15. ĐIỂM CẦN XÁC NHẬN VÀ LỘ TRÌNH](#15-điểm-cần-xác-nhận-và-lộ-trình)
- [PHỤ LỤC A. THUẬT NGỮ VÀ QUY ƯỚC](#phụ-lục-a-thuật-ngữ-và-quy-ước)

# 1. GIỚI THIỆU VÀ PHẠM VI

## 1.1. Bối cảnh

Đoàn khoa cần quản lý hồ sơ đoàn viên theo MSSV và theo dõi việc lưu giữ, cho mượn, hoàn trả sổ Đoàn vật lý tại văn phòng. Quy trình hiện có dễ phát sinh sai lệch khi tra cứu bằng giấy tờ, thiếu lịch sử người giao/nhận, hoặc không xác định được người đã xử lý một giao dịch.

## 1.2. Mục tiêu V1.0

- Quản lý danh sách đoàn viên, lớp/Chi đoàn và tình trạng hoạt động của hồ sơ.

- Theo dõi chính xác trạng thái sổ vật lý theo ba trạng thái đã thống nhất.

- Tạo phiếu tiếp nhận, phiếu mượn, phiếu trả; giữ đầy đủ lịch sử và người xử lý.

- Phân quyền Admin – Bí thư Đoàn khoa – Cán bộ Đoàn theo phạm vi được giao.

- Tạo tài khoản cho sinh viên hoặc nhân sự trường; khởi tạo và khôi phục Admin bằng email OTP.

- Hỗ trợ tìm kiếm MSSV, nhập mới hàng loạt qua Excel và tra cứu tình trạng mượn quá hạn.

## 1.3. Trong phạm vi

| **Nhóm chức năng** | **Nội dung V1.0**                                                                           |
|--------------------|---------------------------------------------------------------------------------------------|
| Hồ sơ              | Thêm, chỉnh sửa có phân quyền, tra cứu, phân lớp, Enable/Disable, không xóa cứng.           |
| Sổ vật lý          | Tiếp nhận, mượn, trả; xác nhận thực tế và tự động cập nhật trạng thái.                      |
| Người nhận sổ      | Chủ sổ, cán bộ lớp/Chi đoàn có thẩm quyền, hoặc người được ủy thác xác minh ngoài hệ thống. |
| Tài khoản          | Người dùng là sinh viên hoặc nhân sự trường, một Admin gốc thuộc loại SYSTEM.               |
| Bảo mật            | RBAC, nhật ký, email OTP cho thiết lập và khôi phục Admin.                                  |
| Tra cứu/Báo cáo    | Lọc theo MSSV/lớp/trạng thái; theo dõi phiếu và quá hạn.                                    |

## 1.4. Ngoài phạm vi

V1.0 chưa triển khai thu đoàn phí, đánh giá đoàn viên, hoạt động phong trào, điểm rèn luyện, chuyển sinh hoạt Đoàn giữa tổ chức, hoặc tự động xác thực giấy ủy quyền qua tổ chức bên ngoài. Chức năng bàn giao sổ vĩnh viễn khi tốt nghiệp chưa được xác nhận, vì vậy chưa đưa vào luồng chính.

# 2. NGỮ CẢNH, TÁC NHÂN VÀ NGUYÊN TẮC

![Hình H01. Các tác nhân, nhóm dữ liệu và thành phần nghiệp vụ chính.](media/H01_context.png)

Hình H01. Các tác nhân, nhóm dữ liệu và thành phần nghiệp vụ chính.

## 2.1. Tác nhân

| **Tác nhân**               | **Vai trò**                                                                                                               |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Admin gốc                  | Quản trị tối cao; tạo và thay Bí thư; khởi tạo kiểm soát tài khoản và xử lý các ngoại lệ theo quyền.                      |
| Bí thư Đoàn khoa           | Quản trị nghiệp vụ gần toàn quyền; thêm/import/sửa đoàn viên; tổ chức cán bộ trực; không được bổ nhiệm Bí thư hoặc Admin. |
| Cán bộ Đoàn                | Nhân sự trực xử lý phiếu tiếp nhận/mượn/trả, tra cứu; không thay đổi hồ sơ đoàn viên hoặc thông tin sổ trực tiếp.         |
| Người giao / nhận / trả sổ | Sinh viên chủ sổ; cán bộ lớp/Chi đoàn; người được ủy thác hợp lệ.                                                         |
| Dịch vụ email              | Gửi OTP xác minh email và đặt lại mật khẩu Admin.                                                                         |
| Người vận hành máy chủ     | Được ủy quyền xử lý bootstrap/khôi phục Admin ở cấp hạ tầng, không phải vai trò nghiệp vụ thông thường.                   |

## 2.2. Nguyên tắc cốt lõi

- MSSV là định danh nghiệp vụ của sinh viên, không tự sinh lại và không dùng chung với mã nhân sự trường.

- Chỉ thay đổi trạng thái sổ qua giao dịch nghiệp vụ thành công; không chỉnh trạng thái bằng sửa tay không có phiếu.

- Hồ sơ đoàn viên Disable là chỉ đọc, dù sổ đang mượn hay đang lưu; Enable/Disable là thao tác quản trị ngoại lệ.

- Mỗi giao dịch phải truy ra tài khoản cán bộ thực hiện, thời điểm máy chủ và trạng thái trước/sau.

- Không xóa cứng hồ sơ, tài khoản và lịch sử giao dịch qua giao diện nghiệp vụ.

- Mỗi thời điểm chỉ có tối đa một tài khoản giữ vai trò Bí thư Đoàn khoa.

# 3. QUẢN LÝ VAI TRÒ VÀ PHÂN QUYỀN

## 3.1. Vai trò chuẩn

| **Mã role** | **Tên vai trò**  | **Nguyên tắc**                                                                      |
|-------------|------------------|-------------------------------------------------------------------------------------|
| ADMIN       | Quản trị viên    | Toàn quyền; Admin gốc username cố định admin.                                       |
| SECRETARY   | Bí thư Đoàn khoa | Gần toàn quyền nghiệp vụ; do Admin bổ nhiệm, chỉ một người tại một thời điểm.       |
| OFFICER     | Cán bộ Đoàn      | Chỉ làm nghiệp vụ văn phòng và tra cứu; không sửa hồ sơ sinh viên hoặc metadata sổ. |

## 3.2. Ma trận quyền V1.0

| **Chức năng**                            | **Admin**              | **Bí thư** | **Cán bộ** |
|------------------------------------------|------------------------|------------|------------|
| Tra cứu đoàn viên / lớp / lịch sử        | ✓                      | ✓          | ✓          |
| Thêm sinh viên thủ công                  | ✓                      | ✓          | —          |
| Import sinh viên từ Excel                | ✓                      | ✓          | —          |
| Chỉnh sửa 8 trường sinh viên             | ✓                      | ✓          | —          |
| Thêm / sửa lớp, Chi đoàn                 | ✓                      | ✓          | —          |
| Thêm hồ sơ cán bộ trường (mã tự sinh)    | ✓                      | ✓          | —          |
| Tạo tài khoản OFFICER cho sinh viên      | ✓                      | ✓          | —          |
| Tạo OFFICER liên kết nhân sự trường      | ✓                      | (\*)       | —          |
| Bổ nhiệm / thay thế SECRETARY            | ✓                      | —          | —          |
| Tạo / cấp / thu hồi ADMIN                | ✓                      | —          | —          |
| Khóa / mở tài khoản OFFICER              | ✓                      | ✓          | —          |
| Tiếp nhận sổ vật lý                      | ✓                      | ✓          | ✓          |
| Lập phiếu cho mượn                       | ✓                      | ✓          | ✓          |
| Xác nhận trả sổ                          | ✓                      | ✓          | ✓          |
| Sửa thông tin sổ ngoài nghiệp vụ         | (\*\*)                 | (\*\*)     | —          |
| Enable / Disable hồ sơ đoàn viên         | ✓                      | ✓          | —          |
| Xem nhật ký thao tác                     | ✓                      | ✓          | ✓          |
| Khởi tạo/khôi phục Admin gốc tại máy chủ | Qua quy trình kỹ thuật | —          | —          |

**Ghi chú:** (\*) Quyền Bí thư tạo OFFICER cho nhân sự trường chưa được nêu trực tiếp; đề xuất cho phép theo tinh thần “gần toàn quyền” nhưng cần xác nhận. (\*\*) Chỉnh sửa metadata sổ chưa được chốt: không cho sửa trực tiếp nếu không có cơ chế điều chỉnh được kiểm soát và audit.

## 3.3. Quy tắc cấp vai trò

> **1.** Chỉ Admin được tạo/bổ nhiệm, thu hồi hoặc thay thế vai trò SECRETARY.
>
> **2.** Mỗi thời điểm chỉ có tối đa một SECRETARY đang được bổ nhiệm; thay người phải thực hiện nguyên tử trong transaction.
>
> **3.** Bí thư được tạo và cấp/thu hồi vai trò OFFICER cho sinh viên có hồ sơ hợp lệ; không thể tạo ADMIN/SECRETARY.
>
> **4.** Cán bộ không được tạo, sửa, khóa tài khoản hoặc tự nâng quyền.
>
> **5.** Mọi thay đổi quyền được ghi security_audit_logs theo actor, target, role cũ/mới, timestamp.

## 3.4. Tài khoản và hồ sơ đoàn viên độc lập

Một người có thể là sinh viên và đồng thời giữ vai trò Bí thư/Cán bộ Đoàn. Vai trò chỉ quyết định quyền trên phần mềm, không làm thay đổi 8 trường hồ sơ sinh viên. Khi hồ sơ sinh viên Disable, tài khoản đăng nhập liên kết với hồ sơ đó không bị tự động Disable; tuy nhiên, các nghiệp vụ ghi trên chính hồ sơ đoàn viên đã Disable vẫn bị chặn.

# 4. HỒ SƠ ĐOÀN VIÊN, LỚP VÀ NHÂN SỰ TRƯỜNG

## 4.1. Tám trường thông tin hồ sơ sinh viên \[CHỐT\]

| **STT** | **Trường dữ liệu**        | **Gợi ý kiểu**      | **Lưu ý**                                            |
|---------|---------------------------|---------------------|------------------------------------------------------|
| 01      | Mã số sinh viên (MSSV)    | VARCHAR(20)         | Mã thật do trường cấp; khóa duy nhất; không tự sinh. |
| 02      | Họ và tên                 | VARCHAR(150)        | Hỗ trợ tiếng Việt có dấu.                            |
| 03      | Lớp danh nghĩa (Chi đoàn) | Mã lớp / khóa ngoại | Phải liên kết danh mục lớp.                          |
| 04      | Ngày sinh                 | DATE                | Định dạng chuẩn hóa.                                 |
| 05      | Giới tính                 | ENUM / VARCHAR      | Giá trị hợp lệ do đơn vị nghiệp vụ xác nhận.         |
| 06      | Số điện thoại             | VARCHAR(20)         | Không ép kiểu số.                                    |
| 07      | Email                     | VARCHAR(254)        | Kiểm tra cú pháp.                                    |
| 08      | Quê quán                  | VARCHAR(255)        | Lưu dạng văn bản theo đầu vào.                       |

**Ghi chú:** Kiểu dữ liệu là đề xuất kỹ thuật. Mức độ bắt buộc của từng trường ngoài MSSV và họ tên chưa được chốt; không tự áp đặt điều kiện khi chưa được duyệt.

## 4.2. Quản lý đoàn viên

- Tạo mới thủ công, chỉ khi MSSV chưa tồn tại trên toàn hệ thống, kể cả hồ sơ Disable.

- Import Excel chỉ dùng để tạo mới: dòng MSSV đã tồn tại phải bị từ chối, không ghi đè dữ liệu.

- Chỉnh sửa hồ sơ hiện hữu do Admin/Bí thư; ghi lại trường thay đổi, giá trị cũ, mới và người cập nhật.

- Không xóa vật lý: quản lý \`is_active\`; mặc định hồ sơ mới Enable, trạng thái sổ “Chưa nộp sổ”.

- Ở Disable: chỉ xem dữ liệu, sổ và lịch sử; không được tạo phiếu, sửa profile, thay trạng thái; riêng Enable/Disable là ngoại lệ quản trị.

## 4.3. Lớp danh nghĩa / Chi đoàn

Lớp/Chi đoàn là danh mục dùng chung, có mã lớp duy nhất và tên hiển thị. Mỗi sinh viên được gắn một lớp danh nghĩa tại thời điểm hiện hành. Quyền thêm/chỉnh sửa lớp thuộc Admin và Bí thư, không thuộc Cán bộ Đoàn. Chuyển lớp phải được audit và không thay đổi lịch sử các phiếu đã tạo.

## 4.4. Hồ sơ nhân sự trường

Lưu hồ sơ nhân sự trường riêng với sinh viên, dùng cho cán bộ/giảng viên/chuyên viên được cấp tài khoản vận hành. Khi tạo hồ sơ nhân sự, hệ thống tự sinh \`staff_code\` duy nhất theo dãy số nội bộ; người nhập không cung cấp mã. Mã đã cấp không tái sử dụng. Họ tên, đơn vị, chức vụ, email và số điện thoại là tập thuộc tính gợi ý, cần xác nhận tính bắt buộc.

# 5. QUẢN LÝ TÀI KHOẢN VÀ LIÊN KẾT ĐỊNH DANH

## 5.1. Phương thức định danh \[CHỐT\]

Không gắn tiền tố SV-/CB- vào mã. Tài khoản lưu \`person_type\` và \`person_code\` để biết liên kết hồ sơ nào. \`person_type\` nhận STUDENT (truy \`students.mssv\`), STAFF (truy \`staff_profiles.staff_code\`) hoặc SYSTEM (dành cho Admin gốc, không cần mã người). \`username\` là tên đăng nhập duy nhất, độc lập với MSSV/mã cán bộ.

![Hình H08. Mô hình liên kết dữ liệu logic: tài khoản và loại đối tượng.](media/H08_data_link.png)

Hình H08. Mô hình liên kết dữ liệu logic: tài khoản và loại đối tượng.

## 5.2. Ví dụ tài khoản

| **username** | **person_type** | **person_code** | **role**  | **Trạng thái** |
|--------------|-----------------|-----------------|-----------|----------------|
| admin        | SYSTEM          | NULL            | ADMIN     | Setup / Active |
| sv_truc01    | STUDENT         | 24635361        | OFFICER   | Active         |
| canbo02      | STAFF           | 000002          | SECRETARY | Active         |

**Ghi chú:** Dữ liệu minh họa, không phải thông tin người dùng thật. Mã STAFF ở đây là mã nội bộ tự sinh, không đồng nghĩa mã nhân sự chính thức của trường.

## 5.3. Ràng buộc khi tạo tài khoản

> **1.** Đảm bảo \`username\` duy nhất (không phân biệt hoa/thường nếu chuẩn hóa theo chính sách).
>
> **2.** Với STUDENT, mã phải tồn tại trong bảng students; với STAFF, mã phải tồn tại trong staff_profiles.
>
> **3.** Với SYSTEM, chỉ dùng cho tài khoản kỹ thuật/khởi tạo được quy định; Admin gốc là trường hợp bắt buộc.
>
> **4.** Kiểm tra quyền của người tạo; Bí thư không được tạo hoặc gán vai trò ADMIN/SECRETARY.
>
> **5.** Lưu mật khẩu dưới dạng hash an toàn; yêu cầu đổi mật khẩu khi được cấp mật khẩu tạm.
>
> **6.** Không tái tạo tài khoản khi Disable; account status độc lập student profile status.
>
> **7.** Khuyến nghị một hồ sơ người tương ứng tối đa một tài khoản hoạt động, trường hợp đặc biệt cần quyết định chính sách.

## 5.4. Quy trình Bí thư tạo tài khoản Cán bộ Đoàn

![Hình H13. Sequence Bí thư cấp quyền OFFICER cho sinh viên hiện có.](media/H13_seq_grant_officer.png)

Hình H13. Sequence Bí thư cấp quyền OFFICER cho sinh viên hiện có.

# 6. ADMIN GỐC, OTP VÀ KHÔI PHỤC

## 6.1. Tài khoản Admin gốc \[CHỐT\]

| **Thuộc tính**     | **Quy định**                                                                                         |
|--------------------|------------------------------------------------------------------------------------------------------|
| username           | Luôn là \`admin\`.                                                                                   |
| Mật khẩu khởi tạo  | \`admin123\`, chỉ dùng trong bootstrap lần đầu (rủi ro cao; bắt buộc khóa chế độ setup).             |
| Vai trò            | ADMIN; person_type = SYSTEM; person_code = NULL.                                                     |
| Đăng nhập lần đầu  | Chưa vào giao diện quản trị; bắt buộc nhập và xác minh email khôi phục qua OTP, sau đó đổi mật khẩu. |
| Sau kích hoạt      | Mật khẩu mặc định không còn hợp lệ; chỉ mật khẩu do Admin thiết lập mới được dùng.                   |
| Quên mật khẩu      | Gửi OTP về email đã xác minh; chỉ sau xác minh OTP mới được đặt mật khẩu mới.                        |
| Mất Admin trong DB | Không tự tạo lại chỉ vì không tìm thấy bản ghi khi system_state đã initialized.                      |

## 6.2. Ràng buộc bảo vệ bootstrap \[ĐỀ XUẤT BẮT BUỘC\]

Mật khẩu \`admin123\` là giá trị công khai, vì vậy bản thân mật khẩu không đủ để chứng minh quyền sở hữu lần đầu. Chế độ thiết lập phải chỉ mở cho người vận hành được ủy quyền (ví dụ chỉ qua localhost/mạng nội bộ kết hợp mã bootstrap ngẫu nhiên lưu ngoài database). Nếu mở setup ra Internet, người truy cập đầu tiên có thể tự gắn email khôi phục và chiếm quyền Admin.

![Hình H07. Flow khởi tạo tài khoản Admin và ngăn tự tạo lại không kiểm soát.](media/H07_admin_bootstrap.png)

Hình H07. Flow khởi tạo tài khoản Admin và ngăn tự tạo lại không kiểm soát.

## 6.3. Quy trình thiết lập lần đầu

> **1.** Khởi chạy ứng dụng: kiểm tra cờ \`system_state.initialized_at\`; chỉ cho bootstrap khi hệ thống thực sự chưa khởi tạo.
>
> **2.** Trong chế độ bootstrap được bảo vệ, tạo một Admin gốc với \`username=admin\`, mật khẩu hash của \`admin123\`, trạng thái \`SETUP_REQUIRED\`.
>
> **3.** Người được phép thiết lập đăng nhập, nhận phiên setup hạn chế, nhập email khôi phục.
>
> **4.** Hệ thống gửi OTP xác minh email; nhập đúng OTP còn hạn thì đánh dấu email verified.
>
> **5.** Chỉ sau xác minh email, cho đặt mật khẩu mới đủ mạnh, khác \`admin123\`.
>
> **6.** Ghi hash mật khẩu mới, chuyển \`setup_completed\`, kết thúc setup, vô hiệu hóa mật khẩu mặc định; buộc đăng nhập lại.

![Hình H11. Sequence đăng nhập lần đầu, xác minh email OTP và đổi mật khẩu Admin.](media/H11_seq_admin_first.png)

Hình H11. Sequence đăng nhập lần đầu, xác minh email OTP và đổi mật khẩu Admin.

## 6.4. Quy trình quên mật khẩu qua OTP

> **1.** Admin chọn Quên mật khẩu; hệ thống chỉ gửi OTP đến email khôi phục đã xác minh.
>
> **2.** Nhập OTP (đề xuất 6 số, 5 phút hiệu lực, tối đa 5 lần sai, gửi lại sau 60 giây).
>
> **3.** Backend xác minh OTP, số lần sai, thời hạn và mục đích RESET_PASSWORD; cấp phiên khôi phục ngắn hạn một lần.
>
> **4.** Người dùng nhập mật khẩu mới và xác nhận mật khẩu; backend cập nhật password_hash.
>
> **5.** Hủy OTP và phiên khôi phục, thu hồi phiên đăng nhập cũ, ghi security audit và thông báo thành công.

![Hình H12. Sequence khôi phục mật khẩu Admin bằng OTP qua email.](media/H12_seq_admin_reset.png)

Hình H12. Sequence khôi phục mật khẩu Admin bằng OTP qua email.

## 6.5. Trường hợp ngoại lệ và an toàn

| **Mã** | **Tình huống**                    | **Xử lý yêu cầu**                                                                                     |
|--------|-----------------------------------|-------------------------------------------------------------------------------------------------------|
| ADM-01 | Lần đầu database trống            | Cho bootstrap có kiểm soát; không tự cấp quyền quản trị cho khách truy cập công khai.                 |
| ADM-02 | Server khởi động lại              | Không tạo lại Admin; giữ mật khẩu hiện tại.                                                           |
| ADM-03 | Xóa thẳng Admin trong DB sau init | Báo sự cố quản trị; không khởi tạo \`admin/admin123\` lại.                                            |
| ADM-04 | Mất email khôi phục               | Khôi phục bằng công cụ vận hành máy chủ và xác minh thẩm quyền; không dùng backdoor mật khẩu cố định. |
| ADM-05 | OTP sai / hết hạn / dùng lại      | Từ chối, giới hạn thử và yêu cầu OTP mới.                                                             |
| ADM-06 | Đổi mật khẩu thành công           | Đăng xuất phiên cũ và vô hiệu mọi OTP hiện hành.                                                      |
| ADM-07 | Admin đổi email khôi phục         | Xác thực lại mật khẩu hiện hành và xác minh email mới trước khi áp dụng.                              |

# 7. QUẢN LÝ SỔ ĐOÀN VÀ GIAO DỊCH VẬT LÝ

## 7.1. Ba trạng thái sổ chính thức \[CHỐT\]

| **Mã**        | **Trạng thái**         | **Ý nghĩa**                                                     |
|---------------|------------------------|-----------------------------------------------------------------|
| NOT_SUBMITTED | Chưa nộp sổ            | Hồ sơ đoàn viên đã có nhưng văn phòng chưa tiếp nhận sổ vật lý. |
| AT_FACULTY    | Đang lưu tại Đoàn khoa | Sổ hiện do văn phòng Đoàn khoa giữ.                             |
| ON_LOAN       | Đã cho mượn            | Sổ đã được bàn giao theo một phiếu mượn chưa kết thúc.          |

![Hình H02. Máy trạng thái sổ; chuyển trạng thái chỉ thông qua nghiệp vụ.](media/H02_book_status.png)

Hình H02. Máy trạng thái sổ; chuyển trạng thái chỉ thông qua nghiệp vụ.

## 7.2. Quy tắc bất biến

- Sổ mới mặc định ở trạng thái “Chưa nộp sổ”.

- Không tồn tại giao dịch mượn hợp lệ nếu sổ không ở “Đang lưu tại Đoàn khoa”.

- Không tồn tại giao dịch trả hợp lệ nếu không có phiếu mượn chưa hoàn tất.

- Trạng thái và phiếu phải được cập nhật nguyên tử trong cùng một transaction.

- Khi quá hạn chỉ phát cảnh báo; không tự động đổi trạng thái hoặc đóng phiếu.

- Hồ sơ Disable không cho lập phiếu mới hoặc hoàn trả cho đến khi Enable lại; trạng thái vật lý giữ nguyên trong thời gian Disable.

## 7.3. Quy định người được nhận sổ

| **Nhóm người**                       | **Điều kiện / xác minh**                                                                                                 |
|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Chính chủ sổ                         | Đối chiếu chủ sổ theo MSSV và xác minh trực tiếp theo quy trình văn phòng.                                               |
| Bí thư Chi đoàn, Phó Bí thư Chi đoàn | Được nhận sổ của đoàn viên thuộc đúng Chi đoàn/lớp mình phụ trách; xác minh vai trò.                                     |
| Lớp trưởng, Lớp phó                  | Được nhận sổ của đoàn viên thuộc đúng lớp; xác minh vai trò.                                                             |
| Người được ủy thác khác              | Cán bộ văn phòng xác minh thủ công ngoài hệ thống và quyết định cho mượn hoặc hủy; V1.0 không tự kiểm tra giấy ủy quyền. |

**Ghi chú:** Các chức vụ lớp/Chi đoàn nêu trên là tư cách nhận sổ, không mặc định là role đăng nhập hệ thống. Nguồn xác nhận chức vụ của cán bộ lớp cần quy định quy trình thực tế.

## 7.4. Tiếp nhận sổ

Đầu vào: MSSV chủ sổ, người giao sổ, cán bộ tiếp nhận và ghi chú (nếu có). Điều kiện: hồ sơ tồn tại, Enable, trạng thái Chưa nộp. Hậu điều kiện: lập phiếu tiếp nhận, đổi sang Đang lưu tại Đoàn khoa, ghi audit. Nếu điều kiện không đạt, giao dịch không phát sinh.

![Hình H03. Flow tiếp nhận sổ Đoàn vật lý.](media/H03_flow_intake.png)

Hình H03. Flow tiếp nhận sổ Đoàn vật lý.

## 7.5. Cho mượn sổ

Đầu vào: MSSV chủ sổ, người thực tế nhận sổ, quan hệ/tư cách, thời hạn mượn và ghi chú. Điều kiện: hồ sơ Enable, sổ Đang lưu, người nhận được xác minh đủ điều kiện. Sau khi xác nhận giao thực tế: lập phiếu mượn; trạng thái Đã cho mượn; lưu cán bộ xử lý và thời hạn dự kiến (nếu có).

| **Thời hạn cho mượn** | **Xử lý**                                                                 |
|-----------------------|---------------------------------------------------------------------------|
| 7 ngày                | Dự kiến trả sau 7 ngày.                                                   |
| 14 ngày               | Dự kiến trả sau 14 ngày.                                                  |
| 1 tháng               | Dự kiến trả sau 1 tháng theo lịch (đề xuất, cần chốt quy tắc cuối tháng). |
| Không thời hạn        | Mặc định; không phát sinh ngày dự kiến trả bắt buộc.                      |

![Hình H04. Flow xét quyền nhận sổ và lập phiếu mượn.](media/H04_flow_loan.png)

Hình H04. Flow xét quyền nhận sổ và lập phiếu mượn.

![Hình H09. Sequence lập phiếu mượn sổ, kiểm tra đồng thời và ghi lịch sử.](media/H09_seq_loan.png)

Hình H09. Sequence lập phiếu mượn sổ, kiểm tra đồng thời và ghi lịch sử.

## 7.6. Nhận trả sổ

Cán bộ tiếp nhận sổ thực tế, tra cứu phiếu mượn đang mở và ghi người trả thực tế (có thể khác người mượn ban đầu). Hệ thống tạo phiếu trả, đóng giao dịch mượn và chuyển trạng thái về Đang lưu tại Đoàn khoa trong cùng transaction. Nếu hồ sơ đã Disable thì áp dụng quy tắc chỉ đọc, phải được người có quyền Enable lại trước khi xử lý.

![Hình H05. Flow nhận trả sổ Đoàn.](media/H05_flow_return.png)

Hình H05. Flow nhận trả sổ Đoàn.

![Hình H10. Sequence tiếp nhận hoàn trả sổ Đoàn.](media/H10_seq_return.png)

Hình H10. Sequence tiếp nhận hoàn trả sổ Đoàn.

## 7.7. Thông tin bắt buộc trên phiếu

| **Nhóm thông tin** | **Trường cần lưu**                                                                                                    |
|--------------------|-----------------------------------------------------------------------------------------------------------------------|
| Phiếu chung        | Mã phiếu; loại phiếu; MSSV chủ sổ; ngày giờ máy chủ; cán bộ xử lý; trạng thái sổ trước/sau; ghi chú.                  |
| Phiếu mượn         | Người nhận thực tế (họ tên, MSSV nếu có); tư cách; kết quả xác minh thủ công khi ủy thác; hạn mượn; ngày dự kiến trả. |
| Phiếu trả          | Tham chiếu phiếu mượn; người trả thực tế; thời điểm nhận lại; cán bộ xác nhận.                                        |
| Phiếu tiếp nhận    | Người giao thực tế; thời điểm tiếp nhận; cán bộ nhận.                                                                 |
| Kiểm soát          | Không sửa/ghi đè phiếu đã chốt; nếu cần đính chính phải tạo sự kiện điều chỉnh được audit (chờ xác nhận cơ chế).      |

# 8. TRA CỨU, IMPORT EXCEL VÀ BÁO CÁO

## 8.1. Tra cứu

Cho phép tìm nhanh theo MSSV, xem hồ sơ, lớp, tình trạng Enable/Disable, trạng thái sổ và các phiếu liên quan. Cho phép lọc danh sách theo lớp/Chi đoàn, trạng thái sổ, hồ sơ hoạt động, thời hạn mượn và quá hạn; dữ liệu Disable vẫn hiển thị ở chế độ đọc.

## 8.2. Import Excel – chỉ thêm mới \[CHỐT\]

- Cung cấp mẫu Excel đúng 8 cột nghiệp vụ; đọc MSSV như chuỗi để không mất số 0 đầu (nếu có).

- Trước khi nhập: kiểm tra định dạng, lớp tồn tại, cột bắt buộc, dữ liệu sai, MSSV trùng trong file và trùng database.

- Dòng trùng MSSV (kể cả hồ sơ Disable) hoặc dữ liệu sai: báo lỗi và bỏ qua, tuyệt đối không update hồ sơ cũ.

- Hiển thị bảng xem trước tổng hợp số dòng hợp lệ, số dòng lỗi; người có quyền phải xác nhận.

- Ghi từng dòng hợp lệ theo cơ chế đảm bảo tính nhất quán, báo lại kết quả số thành công/thất bại; log người import và file nguồn.

![Hình H06. Flow kiểm tra và import đoàn viên từ Excel.](media/H06_flow_import.png)

Hình H06. Flow kiểm tra và import đoàn viên từ Excel.

## 8.3. Thống kê và danh sách

| **Mã báo cáo** | **Tên / chỉ số**                                   | **Lưu ý**                                                       |
|----------------|----------------------------------------------------|-----------------------------------------------------------------|
| RPT-01         | Số đoàn viên theo lớp và trạng thái Enable/Disable | Không suy ra tình trạng sổ từ Enable/Disable.                   |
| RPT-02         | Số sổ theo ba trạng thái vật lý                    | Tổng trạng thái phải đối chiếu được số sổ theo hồ sơ.           |
| RPT-03         | Danh sách phiếu mượn đang mở                       | Hiện chủ sổ, người nhận, ngày mượn, hạn dự kiến.                |
| RPT-04         | Danh sách sổ quá hạn dự kiến                       | Chỉ cảnh báo, không tự đổi trạng thái.                          |
| RPT-05         | Lịch sử xử lý theo cán bộ                          | Hỗ trợ đối soát; giữ nguyên thông tin khi tài khoản bị Disable. |

# 9. DANH MỤC YÊU CẦU CHỨC NĂNG

| **ID**     | **Mô tả yêu cầu**                                                          |
|------------|----------------------------------------------------------------------------|
| FR-SV-01   | Tạo hồ sơ sinh viên bằng MSSV thật; từ chối MSSV đã có.                    |
| FR-SV-02   | Chỉnh sửa 8 trường hồ sơ chỉ bởi Admin/Bí thư; audit thay đổi.             |
| FR-SV-03   | Disable hồ sơ làm toàn bộ nghiệp vụ ghi thành READ-ONLY.                   |
| FR-SV-04   | Enable hồ sơ bởi Admin/Bí thư; lưu người/lý do và thời điểm.               |
| FR-SV-05   | Không xóa cứng hoặc tái sử dụng MSSV đã tồn tại.                           |
| FR-CLS-01  | Quản lý danh mục lớp/Chi đoàn và liên kết sinh viên.                       |
| FR-STF-01  | Tạo hồ sơ nhân sự trường, tự sinh mã nội bộ duy nhất.                      |
| FR-ACC-01  | Tạo tài khoản theo person_type + person_code, ngoại lệ SYSTEM.             |
| FR-ACC-02  | Tạo và thu hồi OFFICER theo quyền; lưu security audit.                     |
| FR-ACC-03  | Chỉ Admin bổ nhiệm SECRETARY; duy nhất một Bí thư tại một thời điểm.       |
| FR-ACC-04  | Độc lập giữa trạng thái account và trạng thái hồ sơ đoàn viên.             |
| FR-ADM-01  | Bootstrap có kiểm soát username admin / mật khẩu đầu admin123.             |
| FR-ADM-02  | Bắt buộc xác minh email bằng OTP và đổi mật khẩu trước khi Admin quản trị. |
| FR-ADM-03  | Quên mật khẩu qua OTP email, không gửi mật khẩu mới.                       |
| FR-ADM-04  | Không tự tạo lại Admin khi đã initialized nhưng thiếu tài khoản.           |
| FR-BOOK-01 | Khởi tạo trạng thái sổ Chưa nộp sổ.                                        |
| FR-BOOK-02 | Tiếp nhận tạo phiếu, chuyển Chưa nộp → Đang lưu.                           |
| FR-BOOK-03 | Mượn tạo phiếu, chuyển Đang lưu → Đã cho mượn.                             |
| FR-BOOK-04 | Trả tạo phiếu, chuyển Đã cho mượn → Đang lưu.                              |
| FR-BOOK-05 | Lưu người nhận/trả thực tế khác người xử lý; kiểm tra tư cách nhận.        |
| FR-BOOK-06 | Cho chọn 7 ngày, 14 ngày, 1 tháng, không thời hạn (mặc định).              |
| FR-BOOK-07 | Cảnh báo quá hạn; không đổi trạng thái tự động.                            |
| FR-BOOK-08 | Chặn ghi trên hồ sơ Disable; không tác động trạng thái hiện có.            |
| FR-IMP-01  | Import Excel create-only; từ chối trùng file và trùng DB.                  |
| FR-IMP-02  | Hiện xem trước, thống kê lỗi theo dòng và xác nhận trước ghi.              |
| FR-SEA-01  | Tra cứu MSSV, lớp, trạng thái, lịch sử và phiếu mở.                        |
| FR-LOG-01  | Lưu event audit với actor, target, before/after, timestamp máy chủ.        |
| FR-LOG-02  | Không sửa/xóa lịch sử phiếu qua thao tác nghiệp vụ thông thường.           |
| FR-RPT-01  | Báo cáo theo trạng thái sổ, lớp, phiếu mở và quá hạn.                      |

**Ghi chú:** ID nêu ở mục 9 là cơ sở traceability từ chức năng tới use case, dữ liệu và test case; các yêu cầu thuộc mục “chờ xác nhận” không được hiểu là đã phê duyệt.

# 10. ĐẶC TẢ USE CASE TRỌNG TÂM

## UC-01 – Thêm đoàn viên

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin hoặc Bí thư</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Đã đăng nhập; tài khoản có quyền CREATE_STUDENT.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Chọn Thêm đoàn viên; điền 8 trường nghiệp vụ.<br />
2. Hệ thống kiểm tra MSSV, lớp và hợp lệ dữ liệu.<br />
3. Kiểm tra MSSV chưa từng tồn tại, kể cả Disable.<br />
4. Lưu hồ sơ Enable, sổ mặc định Chưa nộp; ghi nhật ký.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Hồ sơ xuất hiện khi tra MSSV; không phát sinh phiếu sổ.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>MSSV trùng, lớp không hợp lệ, thiếu dữ liệu hoặc không đủ quyền: từ chối và không ghi một phần.</td>
</tr>
</tbody>
</table>

## UC-02 – Import danh sách Excel

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin hoặc Bí thư</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>File theo mẫu; người dùng có quyền IMPORT_STUDENT.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tải file và đọc các dòng.<br />
2. Kiểm tra cấu trúc 8 cột, mã lớp, MSSV chuỗi và trùng dữ liệu.<br />
3. Hiện xem trước dòng hợp lệ/lỗi.<br />
4. Người dùng xác nhận; chỉ insert dòng hợp lệ; xuất kết quả.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Các hồ sơ mới được tạo với trạng thái Chưa nộp; hồ sơ cũ không thay đổi.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>File lỗi định dạng, MSSV trùng trong file/DB, lỗi ghi một số dòng: trả kết quả theo dòng.</td>
</tr>
</tbody>
</table>

## UC-03 – Tiếp nhận sổ Đoàn

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin, Bí thư hoặc Cán bộ</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Hồ sơ tồn tại, Enable và trạng thái Chưa nộp.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tra MSSV.<br />
2. Xác nhận có sổ vật lý và người giao thực tế.<br />
3. Lập phiếu tiếp nhận; xác nhận.<br />
4. Trong một transaction tạo phiếu, đổi trạng thái sang Đang lưu và ghi audit.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Sổ được ghi nhận đang lưu tại văn phòng; có biên nhận.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Hồ sơ Disable, sai trạng thái, xung đột đồng thời: từ chối.</td>
</tr>
</tbody>
</table>

## UC-04 – Cho mượn sổ

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin, Bí thư hoặc Cán bộ</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Hồ sơ Enable, sổ Đang lưu, xác minh người nhận.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tra MSSV và chi tiết sổ.<br />
2. Xác định chủ sổ / chức vụ lớp / người được ủy thác.<br />
3. Kiểm tra tư cách người nhận; ghi người nhận, thời hạn, ghi chú.<br />
4. Xác nhận bàn giao, tạo phiếu mượn và chuyển Đã cho mượn nguyên tử.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Phiếu mượn đang mở, có cán bộ xử lý và người nhận thực tế.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Không đủ điều kiện, sai lớp, chưa xác minh ủy thác, phiếu mượn đồng thời: từ chối.</td>
</tr>
</tbody>
</table>

## UC-05 – Nhận trả sổ

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin, Bí thư hoặc Cán bộ</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Hồ sơ Enable, sổ Đã cho mượn, có phiếu đang mở.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tra MSSV hoặc mã phiếu mượn.<br />
2. Nhận lại sổ vật lý; ghi thông tin người trả.<br />
3. Xác nhận trả và tham chiếu phiếu mượn.<br />
4. Tạo phiếu trả, đóng phiếu mượn, chuyển Đang lưu, ghi audit.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Sổ trở lại đang lưu và có lịch sử mượn/trả liên kết.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Không có phiếu mở, hồ sơ Disable, trạng thái không tương thích: từ chối.</td>
</tr>
</tbody>
</table>

## UC-06 – Enable/Disable đoàn viên

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin hoặc Bí thư</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Hồ sơ tồn tại; người thao tác có quyền MANAGE_STUDENT_STATUS.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tra hồ sơ và chọn Enable/Disable.<br />
2. Nhập lý do quản trị theo chính sách.<br />
3. Hệ thống ghi actor, lý do, trước/sau, thời gian.<br />
4. Chuyển trạng thái hồ sơ; không thay trạng thái sổ.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Khi Disable, mọi thao tác nghiệp vụ ghi lên hồ sơ này bị chặn.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Cán bộ không được thao tác; thay đổi Enable/Disable phải được audit.</td>
</tr>
</tbody>
</table>

## UC-07 – Bổ nhiệm hoặc thay Bí thư

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Đã đăng nhập role ADMIN; có hồ sơ người nhận vai trò.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tra tài khoản người được bổ nhiệm.<br />
2. Kiểm tra người này đủ điều kiện và hiện trạng Bí thư.<br />
3. Trong transaction thu hồi Bí thư cũ nếu có, bổ nhiệm người mới.<br />
4. Ghi lịch sử role change; không xóa tài khoản cũ.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Hệ thống có tối đa một Bí thư hiện hành.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Nếu không kiểm tra được điều kiện hoặc xung đột cập nhật: rollback toàn bộ.</td>
</tr>
</tbody>
</table>

## UC-08 – Bí thư tạo tài khoản Cán bộ Đoàn

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Bí thư (Admin cũng được)</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Sinh viên có hồ sơ; chưa có tài khoản trùng theo quy tắc.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tra hồ sơ sinh viên bằng MSSV.<br />
2. Nhập username và phương án cấp mật khẩu ban đầu.<br />
3. Hệ thống kiểm tra quyền SECRETARY và username duy nhất.<br />
4. Tạo account STUDENT liên kết MSSV, gán OFFICER, ghi audit.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Sinh viên đăng nhập được sau khi hoàn tất bước thiết lập mật khẩu theo chính sách.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Không tạo được role SECRETARY/ADMIN; MSSV không tồn tại, trùng tài khoản hoặc sai quyền: từ chối.</td>
</tr>
</tbody>
</table>

## UC-09 – Thiết lập Admin lần đầu

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Người vận hành có quyền setup; Admin gốc</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Database chưa bootstrap; setup được bảo vệ khỏi truy cập công khai.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Tạo admin với mật khẩu tạm đã định và phiên SETUP_REQUIRED.<br />
2. Đăng nhập setup; nhập email khôi phục.<br />
3. Gửi/kiểm tra OTP và đánh dấu email verified.<br />
4. Đặt mật khẩu mới, vô hiệu mật khẩu tạm và đánh dấu setup hoàn tất.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Admin chỉ quản trị sau khi xác minh email và đổi mật khẩu.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Setup công khai, OTP sai/hết hạn, đã initialized: ngăn kích hoạt trái phép.</td>
</tr>
</tbody>
</table>

## UC-10 – Quên mật khẩu Admin bằng OTP

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 79%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Thuộc tính</strong></th>
<th><strong>Đặc tả</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Tác nhân</td>
<td>Admin gốc</td>
</tr>
<tr class="even">
<td>Tiền điều kiện</td>
<td>Đã thiết lập email khôi phục xác minh.</td>
</tr>
<tr class="odd">
<td>Luồng chính</td>
<td>1. Chọn Quên mật khẩu; yêu cầu OTP.<br />
2. Backend gửi OTP tới email đã xác minh.<br />
3. Nhập OTP; kiểm tra hạn, số lần sai và một lần sử dụng.<br />
4. Cho đặt mật khẩu mới; thu hồi token/phiên cũ; audit.</td>
</tr>
<tr class="even">
<td>Hậu điều kiện</td>
<td>Admin đăng nhập được bằng mật khẩu mới, không gửi mật khẩu qua email.</td>
</tr>
<tr class="odd">
<td>Ngoại lệ</td>
<td>Email không sẵn, mất quyền truy cập email, OTP hết hạn/sai: quy trình lỗi tương ứng.</td>
</tr>
</tbody>
</table>

# 11. MÔ HÌNH DỮ LIỆU LOGIC

## 11.1. Nguyên tắc thiết kế

Phân biệt (a) hồ sơ đoàn viên; (b) hồ sơ nhân sự trường; (c) tài khoản xác thực; (d) trạng thái sổ và giao dịch vật lý; (e) nhật ký an ninh/nghiệp vụ. Mô hình dưới đây là đề xuất logic để phục vụ thiết kế DB, chưa thay thế thiết kế ERD vật lý.

## 11.2. Danh mục bảng

| **Bảng**            | **Khóa / dữ liệu chính**                                                    | **Ghi chú**                                            |
|---------------------|-----------------------------------------------------------------------------|--------------------------------------------------------|
| students            | mssv; 8 trường; is_active; metadata                                         | MSSV thật; không xóa cứng; unique.                     |
| classes             | class_id; class_code; class_name                                            | Danh mục lớp/Chi đoàn.                                 |
| staff_profiles      | staff_code; full_name; unit; title; contact                                 | Mã tự sinh; độc lập sinh viên.                         |
| accounts            | id; username; password_hash; person_type; person_code; role                 | SYSTEM là ngoại lệ Admin gốc.                          |
| book_records        | student_mssv; current_status; version                                       | Tối đa một bản ghi sổ hiện hành cho mỗi đoàn viên.     |
| book_transactions   | id; type; owner_mssv; receiver/returner; operator; timestamps; before/after | Phiếu tiếp nhận/mượn/trả; append-only.                 |
| system_state        | initialized_at; initial_admin_id; setup_version                             | Phân biệt triển khai mới và mất Admin.                 |
| otp_verifications   | id; account_id; purpose; otp_hash; expires_at; attempts; consumed_at        | Chỉ OTP mục đích SETUP_EMAIL / RESET_PASSWORD.         |
| audit_logs          | id; actor_account_id; action; target; old/new; timestamp                    | Không chứa mật khẩu, OTP, token.                       |
| security_audit_logs | actor; action; account target; before/after; timestamp                      | Có thể gộp vào audit_logs bằng event_type nếu phù hợp. |

## 11.3. Ràng buộc \`accounts.person_type + person_code\`

| **person_type** | **person_code**           | **Liên kết**                                   |
|-----------------|---------------------------|------------------------------------------------|
| STUDENT         | MSSV thật                 | students.mssv                                  |
| STAFF           | Mã nhân sự nội bộ tự sinh | staff_profiles.staff_code                      |
| SYSTEM          | NULL                      | Không liên kết hồ sơ người; dành cho Admin gốc |

Đây là quan hệ logic đa hình: cơ sở dữ liệu quan hệ không tự tạo một foreign key duy nhất trỏ tùy điều kiện đến hai bảng. Backend phải kiểm tra tồn tại và tính nhất quán khi tạo/sửa tài khoản. Nếu cần bảo đảm ràng buộc ở DB, cân nhắc bảng người dùng chung với khóa ngoại chuẩn; lựa chọn này là bước thiết kế kỹ thuật, không thay đổi nghiệp vụ.

## 11.4. Dữ liệu phiếu mượn / trả

| **Trường logic**    | **Loại**            | **Ý nghĩa**                                                      |
|---------------------|---------------------|------------------------------------------------------------------|
| transaction_id      | UUID / BIGINT       | Mã phiếu duy nhất.                                               |
| transaction_type    | ENUM                | INTAKE / LOAN / RETURN.                                          |
| owner_mssv          | VARCHAR             | MSSV đoàn viên sở hữu sổ.                                        |
| related_loan_id     | ID nullable         | Phiếu trả tham chiếu phiếu mượn tương ứng.                       |
| actual_party_name   | VARCHAR             | Họ tên người giao, nhận hoặc trả thực tế.                        |
| actual_party_mssv   | VARCHAR nullable    | MSSV người nhận/trả nếu có.                                      |
| receiver_capacity   | ENUM/string         | Chủ sổ, Bí thư/Phó Bí thư, Lớp trưởng/Lớp phó, ủy thác.          |
| manual_verified_by  | account_id nullable | Ai xác minh trường hợp ủy thác ngoài hệ thống.                   |
| loan_duration_type  | ENUM nullable       | 7D / 14D / 1M / UNLIMITED.                                       |
| expected_return_at  | TIMESTAMP nullable  | Ngày dự kiến trả; không có nếu không thời hạn.                   |
| processed_by        | account_id          | Tài khoản trực tiếp xử lý nghiệp vụ.                             |
| status_before/after | ENUM                | Giá trị trước và sau, để truy vết.                               |
| created_at          | TIMESTAMP           | Thời điểm máy chủ.                                               |
| note                | TEXT nullable       | Ghi chú tùy chọn; không chứa thông tin nhạy cảm không cần thiết. |

## 11.5. Ràng buộc dữ liệu bắt buộc

- MSSV unique kể cả hồ sơ Disable; không tái sử dụng mã đã tồn tại.

- staff_code unique, sinh tự động không trùng và không tái sử dụng; để dạng chuỗi để giữ số 0 đầu.

- username unique; Admin gốc có username cố định \`admin\`.

- Tối đa một SECRETARY hiện hành: kiểm soát cả ứng dụng và database/transaction để tránh race condition.

- Tối đa một phiếu mượn đang mở cho cùng một sổ; lập phiếu và cập nhật trạng thái trong transaction.

- Một OTP chỉ có một mục đích, có giới hạn thử, có thời hạn và chỉ được dùng một lần.

- Nhật ký bảo mật phải đảm bảo khả năng truy cứu ngay cả khi tài khoản bị Disable.

# 12. QUY TẮC DỮ LIỆU, KIỂM SOÁT VÀ NHẬT KÝ

## 12.1. Nhóm quy tắc nghiệp vụ đã thống nhất

| **Mã** | **Quy tắc**                                                                                      |
|--------|--------------------------------------------------------------------------------------------------|
| BR-01  | MSSV do trường cấp, không tự sinh; không tạo MSSV đã tồn tại trong DB.                           |
| BR-02  | Hồ sơ đoàn viên có 8 trường nghiệp vụ xác định ở mục 4.1.                                        |
| BR-03  | Dòng Excel trùng MSSV không ghi đè hồ sơ cũ.                                                     |
| BR-04  | Không xóa cứng hồ sơ đoàn viên; Disable chỉ đọc.                                                 |
| BR-05  | Sổ có đúng 3 trạng thái V1.0, thay đổi bằng phiếu hợp lệ.                                        |
| BR-06  | Tiếp nhận, mượn, trả tương ứng các chuyển trạng thái đã quy định.                                |
| BR-07  | Người nhận có thể là chủ sổ, cán bộ lớp/Chi đoàn hoặc người được ủy thác được xác minh thủ công. |
| BR-08  | Hạn mượn tùy chọn; mặc định không thời hạn; quá hạn chỉ cảnh báo.                                |
| BR-09  | Người trả thực tế có thể khác người mượn và phải được ghi lại.                                   |
| BR-10  | Cán bộ Đoàn không được sửa hồ sơ sinh viên hay metadata sổ.                                      |
| BR-11  | Admin toàn quyền; Bí thư gần toàn quyền, không cấp vai trò Admin/Bí thư.                         |
| BR-12  | Tại một thời điểm chỉ có một Bí thư Đoàn khoa.                                                   |
| BR-13  | Mã nhân sự trường tự sinh, mã sinh viên dùng mã thật.                                            |
| BR-14  | Account phân loại bằng person_type/person_code không thêm tiền tố mã.                            |
| BR-15  | Admin gốc username admin; mật khẩu đầu admin123 trong môi trường setup kiểm soát.                |
| BR-16  | Admin lần đầu xác minh email bằng OTP rồi đặt mật khẩu mới.                                      |
| BR-17  | Quên mật khẩu Admin bằng OTP email; không gửi mật khẩu.                                          |
| BR-18  | Khởi động lại hoặc xóa Admin sau init không được tự bootstrap admin123.                          |
| BR-19  | Tất cả hoạt động ghi phải gắn account thực hiện, thời điểm máy chủ và lịch sử.                   |

## 12.2. Nhật ký cần thu thập

| **Sự kiện**                          | **Thông tin bắt buộc**                                                            |
|--------------------------------------|-----------------------------------------------------------------------------------|
| STUDENT_CREATE/UPDATE/ENABLE/DISABLE | Actor; MSSV; dữ liệu trước/sau hoặc danh sách trường đổi; lý do; thời gian.       |
| BOOK_INTAKE/LOAN/RETURN              | Actor; MSSV chủ sổ; phiếu; người nhận/trả; trạng thái trước/sau; thời gian.       |
| ACCOUNT_CREATE/LOCK/ROLE_CHANGE      | Actor; tài khoản bị tác động; role trước/sau; thời gian.                          |
| ADMIN_SETUP / OTP_RESET              | Mục đích; actor hoặc kênh setup; thời gian; kết quả; không ghi OTP hoặc mật khẩu. |
| IMPORT_STUDENTS                      | Actor; tổng dòng; số hợp lệ; số bỏ qua; lỗi, dấu vết file nguồn an toàn.          |

## 12.3. Quy tắc đồng thời

Nếu hai cán bộ cùng bấm cho mượn một sổ, chỉ một yêu cầu được tạo phiếu thành công. Backend phải kiểm tra lại trạng thái ngay trước khi ghi và dùng khóa bản ghi/phiên bản hoặc cơ chế transaction tương đương. Với mọi lỗi giữa chừng, phiếu và trạng thái phải rollback cùng nhau.

# 13. YÊU CẦU PHI CHỨC NĂNG

| **Mã** | **Nhóm**       | **Yêu cầu / tiêu chí đề xuất**                                                                                                  |
|--------|----------------|---------------------------------------------------------------------------------------------------------------------------------|
| NFR-01 | Xác thực       | Không lưu plaintext password. Hash bằng Argon2id hoặc thuật toán thích hợp được duy trì an toàn; HTTPS bắt buộc khi triển khai. |
| NFR-02 | Phiên          | Session/token có hết hạn; thu hồi sau reset mật khẩu, Disable tài khoản hoặc nghi ngờ xâm nhập.                                 |
| NFR-03 | OTP            | Mã 6 chữ số; hết hạn 5 phút; tối đa 5 lần sai; gửi lại sau 60 giây; giới hạn tốc độ; lưu dạng hash/HMAC.                        |
| NFR-04 | RBAC           | Backend kiểm tra quyền với mọi thao tác; không chỉ ẩn nút UI.                                                                   |
| NFR-05 | Ràng buộc      | DB có unique constraints cho MSSV, username, staff_code; transaction cho thay Bí thư và mượn/trả.                               |
| NFR-06 | Bảo mật setup  | Dù yêu cầu admin123, bootstrap phải cần quyền hạ tầng/mã one-time; setup bị đóng vĩnh viễn sau kích hoạt.                       |
| NFR-07 | Nhật ký        | Ghi log thay đổi với đồng hồ máy chủ; không ghi password, OTP, token hoặc thông tin bí mật.                                     |
| NFR-08 | Sao lưu        | Có lịch sao lưu và kịch bản phục hồi được kiểm thử; quyền DB đủ hạn chế để giảm rủi ro xóa Admin.                               |
| NFR-09 | Hiệu năng      | Đề xuất tra cứu MSSV phổ biến hoàn thành dưới 2 giây trong điều kiện tải vận hành thông thường; phải đo khi triển khai.         |
| NFR-10 | Tính khả dụng  | Form rõ lỗi nghiệp vụ; xác nhận các thao tác thay đổi trạng thái; hỗ trợ tiếng Việt, tìm kiếm nhanh MSSV.                       |
| NFR-11 | Bảo vệ dữ liệu | Chỉ thu thập thông tin cần thiết; phân quyền xem dữ liệu cá nhân; bảo vệ dữ liệu xuất báo cáo.                                  |
| NFR-12 | Hệ thống email | Thất bại gửi OTP không được xác minh email hoặc thay mật khẩu; cho yêu cầu gửi lại có rate limit.                               |

**Ghi chú:** Các ngưỡng thời gian, hiệu năng, tỷ lệ sẵn sàng và chính sách sao lưu là đề xuất phi chức năng, cần xác nhận theo hạ tầng thực tế.

# 14. KỊCH BẢN KIỂM THỬ NGHIỆM THU

| **ID** | **Kịch bản**                                          | **Kết quả kỳ vọng**                                                 |
|--------|-------------------------------------------------------|---------------------------------------------------------------------|
| AT-01  | Admin thêm MSSV mới                                   | Hồ sơ tạo thành công; book status Chưa nộp.                         |
| AT-02  | Import MSSV đã có và đã Disable                       | Dòng bị từ chối; không ghi đè/khôi phục hồ sơ.                      |
| AT-03  | Cán bộ thử sửa số điện thoại đoàn viên                | 403/không đủ quyền; không đổi dữ liệu.                              |
| AT-04  | Bí thư thêm sinh viên, import file                    | Thành công theo điều kiện dữ liệu hợp lệ.                           |
| AT-05  | Bí thư tự bổ nhiệm Bí thư khác                        | Từ chối; không tạo Bí thư thứ hai.                                  |
| AT-06  | Admin thay Bí thư                                     | Vai trò cũ bị thu hồi và vai trò mới cấp trong 1 transaction.       |
| AT-07  | Cán bộ tiếp nhận sổ chưa nộp                          | Tạo phiếu; trạng thái chuyển Đang lưu.                              |
| AT-08  | Mượn sổ khi Chưa nộp                                  | Từ chối; không có phiếu mượn.                                       |
| AT-09  | Mượn sổ người được ủy thác                            | Cán bộ phải xác minh thủ công rồi mới quyết định; ghi nhận kết quả. |
| AT-10  | Hai cán bộ cùng mượn một sổ                           | Chỉ một phiếu thành công.                                           |
| AT-11  | Mượn không thời hạn                                   | Không đặt hạn dự kiến; giữ status Đã cho mượn.                      |
| AT-12  | Quá hạn mượn 7 ngày                                   | Cảnh báo; không tự đóng phiếu hoặc đổi status.                      |
| AT-13  | Trả bởi người khác người mượn                         | Lưu người trả thực tế; chuyển status Đang lưu.                      |
| AT-14  | Disable khi sổ đang cho mượn                          | Hồ sơ Disable; status vẫn Đã cho mượn, không mất phiếu.             |
| AT-15  | Cán bộ cố trả sổ khi hồ sơ Disable                    | Từ chối theo quy tắc chỉ đọc.                                       |
| AT-16  | Enable lại hồ sơ Disable                              | Có audit; nghiệp vụ mới hoạt động theo quyền.                       |
| AT-17  | Tạo cán bộ trường                                     | Hệ thống tự sinh staff_code duy nhất; không nhập thủ công.          |
| AT-18  | Tài khoản STUDENT trỏ MSSV không tồn tại              | Từ chối tạo account.                                                |
| AT-19  | Khởi tạo Admin lần đầu                                | Setup hạn chế; bắt buộc OTP email rồi đổi mật khẩu.                 |
| AT-20  | Dùng lại admin123 sau setup                           | Đăng nhập thất bại.                                                 |
| AT-21  | Quên mật khẩu Admin, OTP đúng                         | Đặt lại được mật khẩu; OTP/phiên cũ bị vô hiệu.                     |
| AT-22  | OTP sai 5 lần hoặc hết hạn                            | Bị từ chối; yêu cầu OTP mới.                                        |
| AT-23  | Xóa Admin sau system_initialized                      | Hệ thống không tự tạo lại admin123.                                 |
| AT-24  | Thao tác sửa bị từ chối từ UI nhưng gọi API trực tiếp | Backend vẫn từ chối theo role và is_active.                         |

# 15. ĐIỂM CẦN XÁC NHẬN VÀ LỘ TRÌNH

## 15.1. Những quyết định chưa chốt

| **ID**  | **Câu hỏi cần phê duyệt**                                                                                                         | **Tác động**                             |
|---------|-----------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| OPEN-01 | Khi đoàn viên tốt nghiệp nhận sổ vĩnh viễn: có cần nghiệp vụ và trạng thái riêng ngoài ba trạng thái hiện tại?                    | Ảnh hưởng trạng thái sổ, báo cáo, phiếu. |
| OPEN-02 | Khi hồ sơ Disable nhưng sổ đang mượn: có cho phép xử lý trả sổ ngoại lệ mà không Enable hay không? Hiện quy tắc đã chốt là không. | Ảnh hưởng quy trình cuối năm/khóa.       |
| OPEN-03 | Bí thư có quyền tạo tài khoản OFFICER cho nhân sự trường hay chỉ cho sinh viên?                                                   | Ảnh hưởng ma trận quyền tạo tài khoản.   |
| OPEN-04 | Bộ thuộc tính nhân sự trường (đơn vị, chức vụ, email, điện thoại), trường bắt buộc và độ dài mã tự sinh.                          | Ảnh hưởng data dictionary.               |
| OPEN-05 | Chức vụ Bí thư/Lớp trưởng/Phó Bí thư/Lớp phó được xác minh từ nguồn nào?                                                          | Ảnh hưởng thao tác kiểm tra người nhận.  |
| OPEN-06 | Có cho phép chỉnh sửa metadata sổ (nếu có) hoặc đính chính phiếu sau xác nhận?                                                    | Ảnh hưởng quyền và lịch sử.              |
| OPEN-07 | “Một tháng” tính theo tháng lịch và quy tắc ngày cuối tháng thế nào?                                                              | Ảnh hưởng ngày dự kiến trả.              |
| OPEN-08 | Tài khoản mỗi người chỉ một role tại một thời điểm hay hỗ trợ nhiều role? Mô hình V1 đang dùng một role chính.                    | Ảnh hưởng schema account_roles.          |
| OPEN-09 | Khi thay Bí thư, tài khoản cũ chuyển OFFICER, giữ không role hay bị khóa?                                                         | Ảnh hưởng lifecycle tài khoản.           |
| OPEN-10 | Phương thức cấp mật khẩu ban đầu cho tài khoản OFFICER/SECRETARY và quy trình tự đặt lại của các vai trò khác.                    | Ảnh hưởng onboarding và security.        |
| OPEN-11 | Chính sách lưu trữ log, quyền xuất báo cáo, sao lưu và công cụ phục hồi Admin ở hạ tầng.                                          | Ảnh hưởng vận hành thực tế.              |

## 15.2. Trình tự triển khai gợi ý

> **1.** Phê duyệt các điểm OPEN có ảnh hưởng trực tiếp mô hình sổ, tài khoản và phân quyền.
>
> **2.** Thiết kế ERD vật lý, ràng buộc DB, transaction và chính sách bảo mật bootstrap.
>
> **3.** Thiết kế API và wireframe theo use case UC-01 đến UC-10.
>
> **4.** Xây dựng module hồ sơ, tài khoản và lớp; sau đó phiếu tiếp nhận/mượn/trả.
>
> **5.** Hoàn thiện Admin email OTP, import Excel, audit và tra cứu/báo cáo.
>
> **6.** Kiểm thử 24 kịch bản nghiệm thu ở mục 14; lập biên bản bàn giao.

# PHỤ LỤC A. THUẬT NGỮ VÀ QUY ƯỚC

| **Thuật ngữ**                             | **Giải thích**                                                                   |
|-------------------------------------------|----------------------------------------------------------------------------------|
| MSSV                                      | Mã số sinh viên thực tế do nhà trường cấp.                                       |
| Chi đoàn/Lớp danh nghĩa                   | Tập hợp đoàn viên theo lớp để tra cứu, quản lý và kiểm tra quyền người nhận.     |
| Sổ Đoàn vật lý                            | Cuốn sổ được văn phòng tiếp nhận, lưu giữ, cho mượn và nhận trả.                 |
| Phiếu giao dịch                           | Biên nhận có định danh cho một lần tiếp nhận/mượn/trả; trạng thái đổi kèm phiếu. |
| Actor                                     | Chủ thể sử dụng hệ thống hoặc tham gia một bước nghiệp vụ.                       |
| RBAC                                      | Role-Based Access Control – phân quyền theo vai trò.                             |
| OTP                                       | One-Time Password – mã xác minh dùng một lần có thời hạn.                        |
| Soft Disable                              | Tắt khả năng ghi mà không xóa bản ghi; vẫn tra cứu được.                         |
| Bootstrap                                 | Thiết lập hệ thống và Admin gốc lúc triển khai đầu tiên.                         |
| Transaction                               | Đơn vị ghi dữ liệu nguyên tử: thành công toàn bộ hoặc rollback toàn bộ.          |
| Audit log                                 | Bản ghi truy vết ai thao tác, khi nào, trước/sau ra sao.                         |
| \[CHỐT\] / \[ĐỀ XUẤT\] / \[CHỜ XÁC NHẬN\] | Ba mức xác nhận yêu cầu nêu tại trang kiểm soát tài liệu.                        |

## Phụ lục B. Tiêu chí phê duyệt tài liệu

Tài liệu được xem là sẵn sàng chuyển sang thiết kế chi tiết khi: (1) đại diện Đoàn khoa xác nhận phân quyền; (2) ba trạng thái sổ và nghiệp vụ tốt nghiệp được chốt; (3) cơ chế bootstrap dùng mật khẩu mặc định được triển khai an toàn; (4) nguồn kiểm tra chức vụ cán bộ lớp được quy định; (5) các kịch bản kiểm thử và trường dữ liệu bắt buộc được duyệt.

**— HẾT TÀI LIỆU —**
