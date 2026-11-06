---
title: 'Change stars to vertical fall'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Change stars to vertical fall

## Intent

**Problem:** The animated stars traveled diagonally, while the desired effect is a direct fall from the top of the screen.

**Approach:** Keep each falling star on a fixed horizontal position, move it vertically through the full viewport, and draw its illuminated tail directly above it.

## Suggested Review Order

- Creates each star above the viewport with a duration matched to screen height.
  [`script.js:25`](../../wedding-background/script.js#L25)

- Moves the star downward while keeping its head and tail on one vertical axis.
  [`script.js:80`](../../wedding-background/script.js#L80)
