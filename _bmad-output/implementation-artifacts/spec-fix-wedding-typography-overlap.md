---
title: 'Fix wedding typography overlap'
type: 'bugfix'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Fix wedding typography overlap

## Intent

**Problem:** On wide viewports, the HLT script font's long strokes escaped their line boxes and overlapped the dividers, ampersand, second name, and wedding date.

**Approach:** Size the names from both viewport dimensions and place both names plus the connector in explicit grid rows whose heights account for the font's glyph overhang.

## Suggested Review Order

- Defines viewport-aware name sizing and three isolated typography rows.
  [`style.css:108`](../../wedding-background/style.css#L108)

- Gives each scripted name a full-height alignment box instead of a compressed line box.
  [`style.css:125`](../../wedding-background/style.css#L125)

- Preserves the same separation model on mobile and low-height landscape screens.
  [`style.css:169`](../../wedding-background/style.css#L169)
