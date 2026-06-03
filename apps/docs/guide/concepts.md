# Concepts

ViteCharts is small by design. A handful of layers compose into the whole library.

## Renderer abstraction

Charts never touch the DOM directly — they draw against a `Renderer` interface. An **SVG**
backend ships today; a DPR-aware **Canvas** backend implements the same surface for dense
data. Chart code is identical either way.

## Spec compiler

Your options are validated and normalized into a `CompiledSpec` — defaults merged, theme
resolved, series colors assigned — before anything renders. Invalid input fails fast with a
clear message.

```ts
import { compileSpec } from '@vitecharts/core';

const spec = compileSpec({ type: 'line', data, x: 'm', series: [{ y: 'v' }] });
```

## Scales & marks

A D3-backed scale system (`linear` / `log` / `time` / `band` / `point` / ordinal-color)
maps data to pixels, feeding composable **mark primitives** — line, area, point, bar, arc.

```ts
import { buildScale, drawLine } from '@vitecharts/core';

const x = buildScale(['A', 'B', 'C'], [0, 300], { type: 'point' });
```

## Reactive store

A tiny `signal` / `effect` / `computed` core drives the lifecycle
(`create → render → update → resize → destroy`). Updating options or resizing the container
re-renders through a single effect.

## Animation engine

Easing + a spring solver + a shared `requestAnimationFrame` scheduler power
renderer-agnostic choreography (draw-on, marker pop, bar grow, arc sweep). Presets `apex`,
`material`, and `none`, plus automatic `prefers-reduced-motion` support. See
[Animation](/features/animation).
