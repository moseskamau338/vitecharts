<div align="center">

# ViteCharts

**Animated, framework-agnostic charts with the feel of ApexCharts — built on the grammar of [Observable Plot](https://observablehq.com/plot/) and [D3](https://d3js.org), bundled with [Vite](https://vitejs.dev).**

[![CI](https://github.com/moseskamau338/vitecharts/actions/workflows/ci.yml/badge.svg)](https://github.com/moseskamau338/vitecharts/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)

</div>

---

ViteCharts pairs a **declarative grammar-of-graphics core** (scales, marks, transforms over D3)
with an **Apex-grade interaction and animation layer** (draw-on, tween/spring, tooltips,
brushing, export) and **thin, idiomatic adapters** for every major UI framework — all from
one tree-shakeable core.

> **Status:** the engine, full chart catalog (line/area/bar/scatter/combo + pie/donut/
> polar/gauge/radar), animation, interaction (tooltip/crosshair/legend/events), brushing &
> sync, annotations, export (SVG/PNG/CSV/JSON), React/Vue/Web-Component adapters, an
> ApexCharts compat shim, ARIA labels, and LTTB downsampling are all in place. Remaining: a
> docs site, deeper a11y/perf hardening, and zoom/pan/toolbar — see [`ROADMAP.md`](./ROADMAP.md).

## Why

|                 | ApexCharts            | Observable Plot | **ViteCharts**                      |
| --------------- | --------------------- | --------------- | ----------------------------------- |
| Animations      | ✅ rich               | ❌ none         | ✅ tween + spring engine            |
| Interactivity   | ✅ toolbar/zoom/brush | ⚠️ minimal      | ✅ (in progress)                    |
| Grammar/compose | ❌ monolithic config  | ✅ marks/scales | ✅ marks/scales + escape hatch      |
| Framework fit   | ⚠️ wrappers           | ⚠️ manual       | ✅ one core, thin adapters          |
| Renderer        | SVG                   | SVG             | SVG **+ Canvas** (backend-agnostic) |
| License         | MIT                   | ISC             | **Apache-2.0**                      |

## Install

```bash
npm install @vitecharts/core
# pnpm add @vitecharts/core · yarn add @vitecharts/core
```

> Not yet published to npm — install from source while we approach `1.0`.

## Quick start

```ts
import { Chart } from '@vitecharts/core';

const chart = new Chart('#chart', {
  type: 'line',
  data: [
    { month: 'Jan', sales: 30, profit: 12 },
    { month: 'Feb', sales: 40, profit: 18 },
    { month: 'Mar', sales: 35, profit: 15 },
    { month: 'Apr', sales: 55, profit: 28 },
  ],
  x: 'month',
  series: [
    { y: 'sales', name: 'Sales', curve: 'smooth' },
    { y: 'profit', name: 'Profit' },
  ],
  theme: 'light',
  markers: true,
  animate: 'apex', // line draw-on + staggered marker pop on mount
  axes: { y: { format: (v) => `$${v}k` } },
});

// Imperative, chainable API
chart.appendData({ month: 'May', sales: 49, profit: 22 }); // animated streaming
chart.updateSeries([{ y: 'sales' }]);
chart.setData(nextDataset);
chart.destroy();
```

## Concepts

- **Renderer abstraction.** Charts draw against a `Renderer` interface, never the DOM.
  An SVG backend ships today; a DPR-aware Canvas backend implements the same surface for
  dense data — chart code is unchanged either way.
- **Spec compiler.** User options are validated and normalized into a `CompiledSpec`
  (defaults, theme, series colors) before rendering.
- **Scales & marks.** A D3-backed scale system (`linear` / `log` / `time` / `band` / `point`
  / ordinal-color) feeds composable mark primitives (line, area, point, bar, arc).
- **Reactive store.** A tiny `signal` / `effect` / `computed` core drives the lifecycle
  (`create → render → update → resize → destroy`).
- **Animation engine.** Easing + spring + a shared rAF scheduler power renderer-agnostic
  choreography (draw-on, marker pop, bar grow, arc sweep), with `apex` / `material` / `none`
  presets and `prefers-reduced-motion` support.

## Framework adapters

One core, thin idiomatic bindings:

```tsx
// React — @vitecharts/react
<Chart type="bar" data={data} x="month" series={[{ y: 'units' }]} animate="apex" />
```

```ts
// Vue 3 — @vitecharts/vue
<ViteChart :options="{ type: 'line', data, x: 'm', series: [{ y: 'v' }] }" />
```

```html
<!-- Any framework / none — @vitecharts/wc -->
<vitecharts-chart id="c"></vitecharts-chart>
<script type="module">
  import '@vitecharts/wc';
  document.getElementById('c').options = { type: 'line', data, x: 'm', series: [{ y: 'v' }] };
</script>
```

Migrating from ApexCharts? `@vitecharts/compat-apex` translates an Apex options object:

```ts
import { fromApex } from '@vitecharts/compat-apex';
new Chart('#el', fromApex(myApexOptions));
```

Svelte / Angular / Solid adapters follow the same thin-wrapper shape next.

## Monorepo

| Package                   | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `@vitecharts/core`        | Engine: renderer, scales, marks, compiler, anim |
| `@vitecharts/react`       | React `<Chart />` component                     |
| `@vitecharts/vue`         | Vue 3 `<ViteChart :options>` component          |
| `@vitecharts/wc`          | `<vitecharts-chart>` web component              |
| `@vitecharts/compat-apex` | `fromApex()` ApexCharts options translator      |
| `@vitecharts/sandbox`     | Dev harness (private)                           |

Svelte / Angular / Solid adapters land next per the roadmap.

## Development

```bash
pnpm install
pnpm dev          # run the sandbox
pnpm test         # unit tests (Vitest)
pnpm typecheck
pnpm build        # build all packages
pnpm lint && pnpm format
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (enforced by
commitlint + husky). Releases are automated with [Changesets](./RELEASING.md).

## License

[Apache-2.0](./LICENSE) © The ViteCharts Authors.

Behavioral/UX inspiration is drawn from ApexCharts; no ApexCharts source is used (clean-room).
