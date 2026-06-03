---
'@vitecharts/core': minor
---

Cartesian chart pack.

- Shared cartesian frame (scales + grid + axes) reused by all cartesian types.
- New chart types: `area` (incl. stacked), `bar`/column (grouped + stacked,
  negative-aware), `scatter` (and bubble via a series `size` key).
- Combo charts via per-series `type` override.
- Per-series entrance animations: bar grow, area fade, line draw-on, point pop.
- New options: `stack`, and series `fillOpacity` / `size`.
