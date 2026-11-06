---
title: 'Focus star perspective'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Focus star perspective

## Intent

**Problem:** The generated particles appeared uniformly small and random instead of forming the strong focused perspective shown in the reference.

**Approach:** Shape the upper canopy around a central luminous focus and project lower particles from a narrow vanishing point, increasing their size and brightness toward the foreground.

## Suggested Review Order

**Focused composition**

- Curves the upper canopy around a brighter central focal region.
  [`script.js:21`](../../wedding-background/script.js#L21)

- Projects the lower field outward from a narrow horizon vanishing point.
  [`script.js:46`](../../wedding-background/script.js#L46)

**Depth cues**

- Scales foreground particle size, brightness, glow, and flare by depth.
  [`script.js:55`](../../wedding-background/script.js#L55)

- Adds restrained light beneath each focus without washing out the black stage.
  [`style.css:42`](../../wedding-background/style.css#L42)
