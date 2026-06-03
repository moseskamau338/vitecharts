---
'@vitecharts/core': minor
---

Visual & UX polish:

- **Responsive height** — charts now size to their container's height (not just
  width) when `height` is omitted, so they fit their box.
- **Smooth crosshair & hover emphasis** — the crosshair line and highlight rings
  now glide between points via a CSS transform transition instead of snapping.
- **Refined default palette** — a modern, indigo-led set that reads well in light
  and dark.
- **No more overlapping axis labels** — categorical x axes subsample tick labels
  to ~the requested count.
- **Smarter value axis** — only bar/area/range types force a zero baseline; line,
  scatter, candlestick, boxplot, and range fit tightly to the data.
