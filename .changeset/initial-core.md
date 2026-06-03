---
'@vitecharts/core': minor
---

Initial core engine.

- Backend-agnostic `Renderer` contract with an SVG backend and an experimental,
  DPR-aware Canvas backend stub.
- Reactive store (`signal` / `effect` / `computed`) driving the chart lifecycle.
- Spec compiler: validation, default merging, theming (light/dark + overrides),
  and series color resolution.
- Scale system over D3 (`linear` / `log` / `time` / `band` / `point` / ordinal color).
- Mark primitives: line, area, point, bar, arc (with curve interpolation).
- Line chart type rendered through scales + marks.
- Imperative `Chart` API: `update`, `updateSeries`, `setData`, `appendData`,
  `destroy`, with responsive resize.
