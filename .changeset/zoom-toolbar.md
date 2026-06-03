---
'@vitecharts/core': minor
---

Zoom, pan, and a toolbar. New options `zoom`, `pan`, `toolbar`:

- wheel-zoom and drag-pan on numeric/time x axes (data is filtered + the x axis
  clamps to the window)
- drag-to-select zoom (selection-zoom) when `zoom` is on
- a floating toolbar with zoom in/out/reset and an export menu (SVG/PNG/CSV/JSON)
- imperative `chart.zoomIn() / zoomOut() / resetZoom()` and a `zoomed` event
