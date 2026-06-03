---
'@vitecharts/core': minor
---

Brushing + chart sync.

- `brush: true` enables drag-to-select over the plot and emits a `brushSelection`
  event with the data values (x0/x1) at the edges — wire it to another chart's
  `axes.x.min/max` for a brush→detail (scrubbing) view.
- `group: '<id>'` syncs hover across charts: peers sharing the id mirror the
  crosshair + tooltip.
