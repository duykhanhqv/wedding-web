---
title: 'Zoom ảnh strip-3 giữ chú chó'
type: 'feature'
created: '2026-10-03'
status: 'done'
route: 'one-shot'
---

# Zoom ảnh strip-3 giữ chú chó

## Intent

**Problem:** Cần phóng lớn hơn ảnh `strip-3.webp` nhưng không được cắt mất chú chó ở góc dưới bên trái.

**Approach:** Tăng zoom lên 22% và đặt điểm neo/crop ở góc trái dưới, ưu tiên phần đáy ảnh chứa chú chó.

## Suggested Review Order

- Đặt vùng ưu tiên và điểm neo ở đáy trái trước khi phóng ảnh.
  [`sections.css:288`](../../css/sections.css#L288)
