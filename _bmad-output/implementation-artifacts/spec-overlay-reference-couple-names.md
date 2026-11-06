---
title: 'Overlay reference couple names'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Overlay reference couple names

## Intent

**Problem:** The selected image background needs the couple's names recreated with the exact supplied HLT script font and the lighter hierarchy shown in the new reference.

**Approach:** Overlay a responsive ceremony title, large scripted names, illuminated ampersand dividers, and wedding date while preserving the image background and vertical falling stars.

## Suggested Review Order

**Content hierarchy**

- Adds semantic ceremony details and accessible couple-name reading order.
  [`index.html:14`](../../wedding-background/index.html#L14)

**Reference typography**

- Loads the supplied HLT font and sizes both names as the dominant visual layer.
  [`style.css:6`](../../wedding-background/style.css#L6)

- Recreates the thin title, dividers, ampersand, and date with restrained glow.
  [`style.css:54`](../../wedding-background/style.css#L54)

**Responsive contrast**

- Fits narrow and low-height screens while protecting text over bright star bands.
  [`style.css:151`](../../wedding-background/style.css#L151)
