---
title: 'Build falling-star wedding background'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Build falling-star wedding background

## Intent

**Problem:** The wedding background folder needs a full-screen animated scene based on the supplied `background.png` image.

**Approach:** Build a responsive HTML/CSS backdrop and a canvas animation with twinkling stars, intermittent falling stars, reduced-motion support, and background-tab pausing.

## Suggested Review Order

**Scene structure**

- Establishes the full-screen decorative layers and loads the animation entry point.
  [`index.html:10`](../../wedding-background/index.html#L10)

**Visual composition**

- Uses the supplied image as a responsive cover with subtle glow and vignette layers.
  [`style.css:22`](../../wedding-background/style.css#L22)

**Animation and performance**

- Creates responsive twinkling stars and diagonal falling-star trails on canvas.
  [`script.js:23`](../../wedding-background/script.js#L23)

- Pauses motion for accessibility and when the browser tab is hidden.
  [`script.js:117`](../../wedding-background/script.js#L117)

**Visual asset**

- Provides the user-selected image used by the full-screen background layer.
  [`background.png`](../../wedding-background/background.png)
