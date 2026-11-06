---
title: 'Add couple typography'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'one-shot'
---

# Add couple typography

## Intent

**Problem:** The star stage needs the couple's names and wedding details styled like the supplied reference.

**Approach:** Load the provided HLT Bickham font for “Hồng Nhung” and “Duy Khánh”, then compose the ceremony title, illuminated dividers, ampersand, and date as responsive semantic HTML.

## Suggested Review Order

**Content structure**

- Adds the accessible ceremony title, couple names, separator, and wedding date.
  [`index.html:14`](../../wedding-background/index.html#L14)

**Signature typography**

- Registers the provided HLT font and applies it exclusively to the couple names.
  [`style.css:6`](../../wedding-background/style.css#L6)

- Matches the reference hierarchy with glowing dividers and centered scripted names.
  [`style.css:62`](../../wedding-background/style.css#L62)

**Responsive fit**

- Adapts typography for narrow phones and low-height landscape screens.
  [`style.css:160`](../../wedding-background/style.css#L160)
