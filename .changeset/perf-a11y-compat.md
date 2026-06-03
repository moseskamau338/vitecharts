---
'@vitecharts/core': minor
'@vitecharts/compat-apex': minor
---

Performance, accessibility, and ApexCharts compatibility.

- core: LTTB downsampling automatically thins line series longer than ~2000
  points (preserving shape); exported as `lttb`.
- core: accessibility — `role="img"`, `aria-label`, and a `<title>` on the SVG,
  with a new `ariaLabel` option (auto-generated fallback).
- new package `@vitecharts/compat-apex` with `fromApex(apexOptions)` to translate
  an ApexCharts config into ViteCharts options (best-effort).
