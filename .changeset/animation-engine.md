---
'@vitecharts/core': minor
---

Animation engine ("Apex feel").

- Tween core: easing library + spring solver + a shared rAF scheduler with batching.
- Renderer-agnostic choreography helpers (via `NodeHandle.set`): line draw-on,
  marker pop, bar grow, arc/donut sweep, fade.
- Animation presets (`apex` / `material` / `none`) and a per-chart `animate` option
  (preset, duration, easing, delay, stagger, dynamic), honoring `prefers-reduced-motion`.
- Line chart plays staggered draw-on + marker pop on mount; in-flight tweens are
  cancelled on redraw/destroy. New `markers` option.
