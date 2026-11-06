---
title: 'Generate black star stage'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Generate black star stage

## Intent

**Problem:** The scene should use a pure black background and reproduce the reference composition without depending on the supplied background image.

**Approach:** Generate a dense upper star canopy, vertical falling stars, and a perspective field of lower light dots in canvas while caching the static particles for smooth responsive rendering.

## Suggested Review Order

**Scene styling**

- Replaces the image with a pure black stage and restrained upper and lower glows.
  [`style.css:22`](../../wedding-background/style.css#L22)

**Generated composition**

- Distributes upper and lower particles with separate depth profiles.
  [`script.js:19`](../../wedding-background/script.js#L19)

- Builds responsive particle counts from the visible canvas area.
  [`script.js:58`](../../wedding-background/script.js#L58)

**Rendering performance**

- Caches dense star fields and animates only selected twinkles and falling stars.
  [`script.js:76`](../../wedding-background/script.js#L76)
