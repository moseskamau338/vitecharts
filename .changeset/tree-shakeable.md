---
'@vitecharts/core': minor
---

Tree-shakeable, registerable chart types.

- The main `@vitecharts/core` entry still registers every chart type on import
  (zero-config — no change for existing users).
- New **`@vitecharts/core/lean`** entry registers nothing; pull in only the chart
  families you `registerCharts(...)` and your bundler drops the rest.
- New API: `registerChart(name, impl)`, `registerCharts(...plugins)`, and the
  registrable plugins `cartesian`, `radial`, `funnel`, `heatmap`.
- The build now preserves the source module graph so chart types tree-shake.
  A line-only app is ~27–31 kB gzipped vs ~34 kB for the full catalog.
