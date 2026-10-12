---
title: 'Chọn nhạc theo ngày thiệp'
type: 'feature'
created: '2026-10-12'
status: 'done'
route: 'one-shot'
---

# Chọn nhạc theo ngày thiệp

## Intent

**Problem:** Ba thiệp đang dùng chung một đường dẫn nhạc nên không thể phát bài riêng theo ngày.

**Approach:** Đưa đường dẫn nhạc vào cấu hình từng thiệp; ngày 14 dùng `LoThuongNhau.mp3`, ngày 15 và 28 dùng `LoThuongNhau2.mp3`, đồng thời giữ bài cũ làm giá trị dự phòng.

## Suggested Review Order

**Luồng chọn nhạc**

- Trình phát lấy bài từ cấu hình thiệp hiện hành và có đường dẫn dự phòng.
  [`envelope.js:160`](../../js/envelope.js#L160)

- Ba cấu hình ánh xạ đúng bài hát theo ngày.
  [`khach-moi.js:27`](../../js/khach-moi.js#L27)

**Tài liệu**

- Hướng dẫn ghi rõ trường cấu hình nhạc nền.
  [`README.md:122`](../../README.md#L122)
