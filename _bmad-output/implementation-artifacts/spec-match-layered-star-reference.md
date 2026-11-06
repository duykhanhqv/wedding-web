---
title: 'Match layered star reference'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Match layered star reference

## Intent

**Problem:** The previous focused layout formed a sparse funnel and still did not resemble the supplied reference image.

**Approach:** Rebuild the composition as a dense full-width ceiling and floor, use central light bands and soft beams, and create foreground depth through varied particle size, brightness, glow, and bokeh.

## Suggested Review Order

**Reference composition**

- Builds a full-width ceiling with a brighter central focus and varied particle sizes.
  [`script.js:21`](../../wedding-background/script.js#L21)

- Creates a dense floor with crisp horizon particles and large foreground bokeh.
  [`script.js:51`](../../wedding-background/script.js#L51)

**Lighting and depth**

- Draws soft ceiling beams down to the illuminated horizon.
  [`script.js:166`](../../wedding-background/script.js#L166)

- Shapes the upper and lower focus bands while preserving the black center stage.
  [`style.css:42`](../../wedding-background/style.css#L42)

**Responsive performance**

- Scales cached particle density and regenerates only for meaningful viewport changes.
  [`script.js:92`](../../wedding-background/script.js#L92)
