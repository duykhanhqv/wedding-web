---
title: 'Match hero schedule font'
type: 'chore'
created: '2026-10-03'
status: 'done'
route: 'one-shot'
---

# Match hero schedule font

## Intent

**Problem:** The cover date and time looked heavier than the reference and had a light shadow around the text.

**Approach:** Use the available light DM Mono weight and remove the text shadow while preserving the existing layout, size, spacing, and content.

## Suggested Review Order

- The schedule now uses the reference-like light font without a shadow.
  [`sections.css:97`](../../css/sections.css#L97)
