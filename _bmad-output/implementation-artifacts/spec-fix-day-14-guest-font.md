---
title: 'Sửa font tên khách thiệp ngày 14'
type: 'bugfix'
created: '2026-10-12'
status: 'done'
route: 'one-shot'
---

# Sửa font tên khách thiệp ngày 14

## Intent

**Problem:** Font VNI cũ trên phong bì không tương thích với chuỗi Unicode, khiến dấu tiếng Việt trong tên khách của thiệp ngày 14 hiển thị sai.

**Approach:** Giữ nguyên font VNI cũ, tự động chuyển riêng tên khách sang bảng mã VNI sau khi font tải thành công; dữ liệu, URL và tên trên trang thiệp vẫn dùng Unicode.

## Suggested Review Order

- Bộ chuyển mã giữ dữ liệu Unicode nhưng cung cấp đúng ký tự cho font VNI cũ.
  [`envelope.js:42`](../../js/envelope.js#L42)

- Font cũ chỉ được bật sau khi tải thành công, tránh chữ lỗi khi font thất bại.
  [`envelope.js:75`](../../js/envelope.js#L75)

- Kiểu chữ VNI được giới hạn riêng cho tên khách trên phong bì.
  [`envelope.css:122`](../../css/envelope.css#L122)
