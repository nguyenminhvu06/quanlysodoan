-- Du lieu sinh vien mau duoc tao tu data/Danh_sach_50_sinh_vien_mau.xlsx.
-- Lop chi co ma trong Excel, nen class_name duoc tam dien bang class_code.
-- Script chi them moi sinh vien; MSSV trung se gay loi va rollback transaction.
\set ON_ERROR_STOP on
\connect quan_ly_so_doan

BEGIN;

INSERT INTO classes (class_code, class_name)
VALUES
    ('DHCNTT20A', 'DHCNTT20A'),
    ('DHKHMT20A', 'DHKHMT20A'),
    ('DHKTPM20A', 'DHKTPM20A'),
    ('DHKTPM20B', 'DHKTPM20B'),
    ('DHTHMT20A', 'DHTHMT20A')
ON CONFLICT (class_code) DO NOTHING;

INSERT INTO students (
    mssv, full_name, class_id, date_of_birth, gender, phone_number, email, hometown
)
VALUES
    ('24640001', 'Nguyễn Minh An', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2005-01-01', 'Nam', '0910000000', 'sv24640001@example.com', 'TP. Hồ Chí Minh'),
    ('24640002', 'Võ Thanh Giang', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2006-08-12', 'Nữ', '0910000001', 'sv24640002@example.com', 'Tiền Giang'),
    ('24640003', 'Lê Hữu Long', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2007-03-23', 'Nam', '0910000002', 'sv24640003@example.com', 'Cần Thơ'),
    ('24640004', 'Bùi Ngọc Mai', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2005-10-06', 'Nữ', '0910000003', 'sv24640004@example.com', 'Bình Dương'),
    ('24640005', 'Hoàng Khánh Vinh', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2006-05-17', 'Nam', '0910000004', 'sv24640005@example.com', 'Đồng Tháp'),
    ('24640006', 'Hồ Thị Anh', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2007-12-28', 'Nữ', '0910000005', 'sv24640006@example.com', 'Đồng Nai'),
    ('24640007', 'Phan Hoài Hải', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2005-07-11', 'Nam', '0910000006', 'sv24640007@example.com', 'Bến Tre'),
    ('24640008', 'Trần Bảo Hoa', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2006-02-22', 'Nữ', '0910000007', 'sv24640008@example.com', 'Bà Rịa - Vũng Tàu'),
    ('24640009', 'Đặng Gia Quân', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2007-09-05', 'Nam', '0910000008', 'sv24640009@example.com', 'Long An'),
    ('24640010', 'Phạm Phương Thảo', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2005-04-16', 'Nữ', '0910000009', 'sv24640010@example.com', 'An Giang'),
    ('24640011', 'Đỗ Quốc Bình', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2006-11-27', 'Nam', '0910000010', 'sv24640011@example.com', 'Tây Ninh'),
    ('24640012', 'Huỳnh Đức Hà', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2007-06-10', 'Nữ', '0910000011', 'sv24640012@example.com', 'Vĩnh Long'),
    ('24640013', 'Nguyễn Minh Nam', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2005-01-21', 'Nam', '0910000012', 'sv24640013@example.com', 'TP. Hồ Chí Minh'),
    ('24640014', 'Võ Thanh My', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2006-08-04', 'Nữ', '0910000013', 'sv24640014@example.com', 'Tiền Giang'),
    ('24640015', 'Lê Hữu Việt', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2007-03-15', 'Nam', '0910000014', 'sv24640015@example.com', 'Cần Thơ'),
    ('24640016', 'Bùi Ngọc Chi', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2005-10-26', 'Nữ', '0910000015', 'sv24640016@example.com', 'Bình Dương'),
    ('24640017', 'Hoàng Khánh Huy', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2006-05-09', 'Nam', '0910000016', 'sv24640017@example.com', 'Đồng Tháp'),
    ('24640018', 'Hồ Thị Hương', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2007-12-20', 'Nữ', '0910000017', 'sv24640018@example.com', 'Đồng Nai'),
    ('24640019', 'Phan Hoài Tuấn', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2005-07-03', 'Nam', '0910000018', 'sv24640019@example.com', 'Bến Tre'),
    ('24640020', 'Trần Bảo Trang', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2006-02-14', 'Nữ', '0910000019', 'sv24640020@example.com', 'Bà Rịa - Vũng Tàu'),
    ('24640021', 'Đặng Gia Dũng', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2007-09-25', 'Nam', '0910000020', 'sv24640021@example.com', 'Long An'),
    ('24640022', 'Phạm Phương Hân', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2005-04-08', 'Nữ', '0910000021', 'sv24640022@example.com', 'An Giang'),
    ('24640023', 'Đỗ Quốc Phong', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2006-11-19', 'Nam', '0910000022', 'sv24640023@example.com', 'Tây Ninh'),
    ('24640024', 'Huỳnh Đức Ngân', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2007-06-02', 'Nữ', '0910000023', 'sv24640024@example.com', 'Vĩnh Long'),
    ('24640025', 'Nguyễn Minh Đạt', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2005-01-13', 'Nam', '0910000024', 'sv24640025@example.com', 'TP. Hồ Chí Minh'),
    ('24640026', 'Võ Thanh Dung', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2006-08-24', 'Nữ', '0910000025', 'sv24640026@example.com', 'Tiền Giang'),
    ('24640027', 'Lê Hữu Khang', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2007-03-07', 'Nam', '0910000026', 'sv24640027@example.com', 'Cần Thơ'),
    ('24640028', 'Bùi Ngọc Mai', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2005-10-18', 'Nữ', '0910000027', 'sv24640028@example.com', 'Bình Dương'),
    ('24640029', 'Hoàng Khánh Vinh', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2006-05-01', 'Nam', '0910000028', 'sv24640029@example.com', 'Đồng Tháp'),
    ('24640030', 'Hồ Thị Anh', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2007-12-12', 'Nữ', '0910000029', 'sv24640030@example.com', 'Đồng Nai'),
    ('24640031', 'Phan Hoài Hải', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2005-07-23', 'Nam', '0910000030', 'sv24640031@example.com', 'Bến Tre'),
    ('24640032', 'Trần Bảo Hoa', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2006-02-06', 'Nữ', '0910000031', 'sv24640032@example.com', 'Bà Rịa - Vũng Tàu'),
    ('24640033', 'Đặng Gia Quân', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2007-09-17', 'Nam', '0910000032', 'sv24640033@example.com', 'Long An'),
    ('24640034', 'Phạm Phương Nhi', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2005-04-28', 'Nữ', '0910000033', 'sv24640034@example.com', 'An Giang'),
    ('24640035', 'Đỗ Quốc An', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2006-11-11', 'Nam', '0910000034', 'sv24640035@example.com', 'Tây Ninh'),
    ('24640036', 'Huỳnh Đức Giang', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2007-06-22', 'Nữ', '0910000035', 'sv24640036@example.com', 'Vĩnh Long'),
    ('24640037', 'Nguyễn Minh Nam', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2005-01-05', 'Nam', '0910000036', 'sv24640037@example.com', 'TP. Hồ Chí Minh'),
    ('24640038', 'Võ Thanh My', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2006-08-16', 'Nữ', '0910000037', 'sv24640038@example.com', 'Tiền Giang'),
    ('24640039', 'Lê Hữu Việt', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2007-03-27', 'Nam', '0910000038', 'sv24640039@example.com', 'Cần Thơ'),
    ('24640040', 'Bùi Ngọc Chi', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2005-10-10', 'Nữ', '0910000039', 'sv24640040@example.com', 'Bình Dương'),
    ('24640041', 'Hoàng Khánh Huy', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2006-05-21', 'Nam', '0910000040', 'sv24640041@example.com', 'Đồng Tháp'),
    ('24640042', 'Hồ Thị Hương', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2007-12-04', 'Nữ', '0910000041', 'sv24640042@example.com', 'Đồng Nai'),
    ('24640043', 'Phan Hoài Sơn', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2005-07-15', 'Nam', '0910000042', 'sv24640043@example.com', 'Bến Tre'),
    ('24640044', 'Trần Bảo Thảo', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2006-02-26', 'Nữ', '0910000043', 'sv24640044@example.com', 'Bà Rịa - Vũng Tàu'),
    ('24640045', 'Đặng Gia Bình', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2007-09-09', 'Nam', '0910000044', 'sv24640045@example.com', 'Long An'),
    ('24640046', 'Phạm Phương Hân', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20A'), '2005-04-20', 'Nữ', '0910000045', 'sv24640046@example.com', 'An Giang'),
    ('24640047', 'Đỗ Quốc Phong', (SELECT class_id FROM classes WHERE class_code = 'DHKTPM20B'), '2006-11-03', 'Nam', '0910000046', 'sv24640047@example.com', 'Tây Ninh'),
    ('24640048', 'Huỳnh Đức Ngân', (SELECT class_id FROM classes WHERE class_code = 'DHKHMT20A'), '2007-06-14', 'Nữ', '0910000047', 'sv24640048@example.com', 'Vĩnh Long'),
    ('24640049', 'Nguyễn Minh Đạt', (SELECT class_id FROM classes WHERE class_code = 'DHCNTT20A'), '2005-01-25', 'Nam', '0910000048', 'sv24640049@example.com', 'TP. Hồ Chí Minh'),
    ('24640050', 'Võ Thanh Dung', (SELECT class_id FROM classes WHERE class_code = 'DHTHMT20A'), '2006-08-08', 'Nữ', '0910000049', 'sv24640050@example.com', 'Tiền Giang');

COMMIT;
