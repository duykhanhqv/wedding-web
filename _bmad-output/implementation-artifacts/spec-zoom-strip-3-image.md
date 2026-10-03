---
title: 'Zoom ảnh strip-3'
type: 'feature'
created: '2026-10-03'
status: 'done'
route: 'one-shot'
---

# Zoom ảnh strip-3

## Intent

**Problem:** Chủ thể trong `strip-3.webp` nhỏ hơn rõ rệt so với hai ảnh bên cạnh, khiến dải ba ảnh thiếu cân đối.

**Approach:** Đánh dấu riêng đúng ảnh cần điều chỉnh và phóng nhẹ 12% bên trong khung cắt sẵn có, không thay đổi kích thước hay bố cục ba cột.

## Suggested Review Order

- Gắn hook trực tiếp vào đúng ảnh, tránh phụ thuộc thứ tự các tấm.
  [`index.html:137`](../../index.html#L137)

- Phóng nhẹ ảnh trong khung ẩn tràn, giữ nguyên bố cục dải ảnh.
  [`sections.css:288`](../../css/sections.css#L288)
