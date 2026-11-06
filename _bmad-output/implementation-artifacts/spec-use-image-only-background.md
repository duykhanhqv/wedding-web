---
title: 'Use image-only wedding background'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Use image-only wedding background

## Intent

**Problem:** The generated typography and particle scene no longer match the desired visual direction.

**Approach:** Remove the wedding text and generated ceiling/floor particles, use `background.png` as the clean full-screen background, and retain only the lightweight vertical falling-star overlay.

## Suggested Review Order

**Clean scene**

- Leaves only the decorative full-screen container and falling-star canvas.
  [`index.html:10`](../../wedding-background/index.html#L10)

- Uses the selected image directly without glow, vignette, or typography overlays.
  [`style.css:22`](../../wedding-background/style.css#L22)

**Animation overlay**

- Keeps only vertical falling stars and resizes the canvas at exact viewport dimensions.
  [`script.js:18`](../../wedding-background/script.js#L18)
