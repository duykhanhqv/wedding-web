---
title: 'Adjust wedding type scale'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Adjust wedding type scale

## Intent

**Problem:** The couple names need greater visual emphasis, while the ceremony title and wedding date need small vertical-position adjustments.

**Approach:** Increase the viewport-aware name scale within the overlap-safe grid, lower the ceremony title through layout spacing, and raise the date with responsive margins.

## Suggested Review Order

- Increases the shared scripted-name scale while retaining protected grid rows.
  [`style.css:109`](../../wedding-background/style.css#L109)

- Lowers the ceremony title using flow-aware spacing rather than visual offsets.
  [`style.css:77`](../../wedding-background/style.css#L77)

- Raises the date consistently on desktop, mobile, and low-height landscape screens.
  [`style.css:152`](../../wedding-background/style.css#L152)
