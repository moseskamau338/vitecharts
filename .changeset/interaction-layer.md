---
'@vitecharts/core': minor
---

Interaction layer.

- Chart types now emit an interaction model (plotted points grouped by x) for
  hit-testing.
- Floating, theme-aware tooltip (shared) with a custom `render` slot.
- Crosshair line on hover.
- Interactive legend that toggles series visibility, with positions.
- Typed event bus on `Chart`: `chart.on('pointerMove' | 'pointerLeave' |
  'markerClick' | 'legendClick', …)`.
- New options: `tooltip`, `legend`, `crosshair`.
