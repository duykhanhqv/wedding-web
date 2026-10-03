---
title: 'Add editable cover overlay'
type: 'chore'
created: '2026-10-03'
status: 'done'
route: 'one-shot'
---

# Add editable cover overlay

## Intent

**Problem:** The clean editable cover photo was brighter and more saturated than the original invitation cover.

**Approach:** Add a cool translucent CSS overlay above the new photo while retaining the editable name and schedule above it.

## Suggested Review Order

- The overlay restores the subdued cover tone without modifying either source image.
  [`sections.css:53`](../../css/sections.css#L53)

- Text sits above the overlay and remains readable and editable.
  [`sections.css:89`](../../css/sections.css#L89)
