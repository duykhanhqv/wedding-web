---
title: 'Dựng bìa thiệp đầu bằng HTML chỉnh sửa được'
type: 'feature'
created: '2026-10-03'
status: 'done'
route: 'one-shot'
---

# Dựng bìa thiệp đầu bằng HTML chỉnh sửa được

## Intent

**Problem:** Trang gốc đang dùng `invite-1.webp` đã in sẵn tên và ngày giờ, nên không thể thay nội dung mà không sửa ảnh.

**Approach:** Dùng `new-invite-1.jpg` làm ảnh nền sạch, tạo bản WebP nhẹ cho trình duyệt, rồi dựng tên và lịch bằng HTML/CSS. Ngày giờ lấy từ cấu hình thiệp để luôn đồng bộ với đếm ngược và file lịch.

## Suggested Review Order

**Bìa chỉnh sửa được**

- Ảnh nền sạch và chữ HTML thay thế ảnh thiệp in sẵn.
  [`index.html:47`](../../index.html#L47)

- Kiểu chữ định vị theo tỉ lệ bìa và giữ độ tương phản.
  [`sections.css:44`](../../css/sections.css#L44)

**Đồng bộ ngày giờ**

- Bìa đọc cùng cấu hình với đếm ngược và lịch tải xuống.
  [`khach-moi.js:99`](../../js/khach-moi.js#L99)
