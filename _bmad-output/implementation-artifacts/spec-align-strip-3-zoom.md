---
title: 'Cân lại ảnh strip-3 đã zoom'
type: 'bugfix'
created: '2026-10-03'
status: 'done'
route: 'one-shot'
---

# Cân lại ảnh strip-3 đã zoom

## Intent

**Problem:** Điểm neo ở mép trái làm ảnh `strip-3.webp` phóng to bị lệch trong ô ảnh.

**Approach:** Giữ zoom 1.5 đang dùng, đặt crop đáy ở giữa và dịch điểm neo vừa đủ về bên trái để chú chó vẫn nằm trong khung.

## Suggested Review Order

- Cân crop theo đáy và điểm neo 42% để giữ bố cục lẫn chú chó.
  [`sections.css:288`](../../css/sections.css#L288)
