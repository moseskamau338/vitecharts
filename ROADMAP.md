# ViteCharts — Roadmap

> A modern, animated, framework-agnostic charting library with the feature surface and
> "feel" of [ApexCharts](https://apexcharts.com), built on the grammar-of-graphics
> foundation of [Observable Plot](https://observablehq.com/plot/), bundled with
> [Vite](https://vitejs.dev) for speed and small footprint.
>
> **License:** Apache-2.0 (full).
> **Status:** Phases 0–2 complete — reactive core, scales, marks, spec compiler, line chart, animation engine.
> **Name:** **ViteCharts** · npm scope `@vitecharts/*`.

---

## 1. Vision & Goals

ApexCharts gives developers a beautiful, batteries-included charting experience —
animations, a polished toolbar, export, brushing/scrubbing, annotations, themes — behind
a single config object. But it's a monolith with its own rendering engine and an API that
can be awkward to extend.

Observable Plot gives a clean, composable **grammar of graphics** (marks, scales,
transforms, facets) on top of D3, with excellent defaults — but it is largely **static**:
no built-in animation, no interactive toolbar, no export pipeline, no scrubbing, limited
tooltips.

**ViteCharts marries the two:** Plot's declarative grammar and scale/mark system underneath, an
Apex-grade interaction + animation + export layer on top, and a thin, idiomatic adapter for
each major UI framework.

### Design principles

1. **Apex feel, Plot bones.** Match Apex's animations, toolbar, tooltips, brushing and
   export UX; keep Plot's composable, declarative core.
2. **One core, many adapters.** All logic lives in a framework-agnostic core. Adapters are
   thin (mount/update/unmount + reactivity bridge).
3. **Better API than Apex.** Typed, discoverable, declarative-first, with an imperative
   escape hatch. No stringly-typed config soup.
4. **Small & fast.** Tree-shakeable, lazy-loaded chart types, ESM-first, Vite-powered.
5. **Accessible by default.** Keyboard nav, ARIA, reduced-motion, high-contrast.
6. **Apache-2.0 throughout.** Every dependency must be license-compatible (see §12).

### Non-goals (initially)

- 3D charts, maps/geo, and Gantt beyond a basic timeline (deferred to post-1.0).
- 1:1 config compatibility with ApexCharts (we offer a _compat adapter_ instead, §9).
- A hosted/SaaS dashboard product.

---

## 2. Architecture Overview

```
                         ┌──────────────────────────────────────┐
                         │            User config (typed)         │
                         └──────────────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │  Adapters (thin)                                                    │
        │  react · vue · svelte · angular · solid · web-component · vanilla   │
        └─────────────────────────────────┼─────────────────────────────────┘
                                          │  normalized options + data
        ┌─────────────────────────────────▼─────────────────────────────────┐
        │  @vitecharts/core                                                       │
        │                                                                     │
        │   options → spec compiler   (validate, defaults, theme merge)       │
        │   chart registry            (lazy chart-type modules)               │
        │   scene graph               (marks → animated SVG/Canvas nodes)     │
        │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
        │   │  Plot core │  │ animation  │  │interaction │  │  export    │    │
        │   │ (scales/   │  │ engine     │  │ (tooltip,  │  │ (svg/png/  │    │
        │   │  marks via │  │ (FLIP +    │  │ zoom/pan,  │  │  csv/json) │    │
        │   │  D3)       │  │ tween/     │  │ brush,     │  │            │    │
        │   │            │  │ spring)    │  │ crosshair) │  │            │    │
        │   └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
        └─────────────────────────────────────────────────────────────────────┘
                                          │
                         ┌────────────────▼────────────────┐
                         │  Renderer backends               │
                         │  SVG (default) · Canvas (dense)  │
                         └──────────────────────────────────┘
```

### Key decisions to lock in Phase 0

- **Monorepo** via pnpm workspaces + Turborepo (or Nx). Packages publish independently.
- **Rendering**: SVG-first (matches Plot + easy export/animation), with a Canvas backend
  for high-density series (scatter/heatmap > N points). Abstract behind a `Renderer`
  interface so marks don't care which backend draws them.
- **Plot usage**: depend on `@observablehq/plot` for scales, marks, and transforms, but
  intercept its render output so we own the DOM nodes (needed for animation + interaction).
  Evaluate building directly on D3 primitives where Plot's static render gets in the way.
- **Animation**: custom engine (FLIP for layout changes + value tweening with spring/easing)
  rather than CSS transitions, so updates, enter/exit, and morphs are first-class.
- **State**: a small reactive store in core (signals); adapters bridge to framework
  reactivity rather than re-implementing it.

---

## 3. Tech Stack

| Concern           | Choice                                                          |
| ----------------- | --------------------------------------------------------------- |
| Language          | TypeScript (strict), ESM-first, `.d.ts` shipped                 |
| Build (lib)       | Vite library mode + `vite-plugin-dts`; Rollup under the hood    |
| Build (apps/docs) | Vite                                                            |
| Monorepo          | pnpm workspaces + Turborepo                                     |
| Core math/scales  | D3 modules (`d3-scale`, `d3-shape`, `d3-array`, `d3-time`, …)   |
| Grammar layer     | `@observablehq/plot`                                            |
| Animation         | In-house engine (popmotion-style springs, no heavy dep)         |
| Testing           | Vitest (unit) · Playwright (e2e + visual regression)            |
| Lint/format       | ESLint + Prettier + `publint` + `arethetypeswrong`              |
| Docs              | VitePress + live editable examples                              |
| CI                | GitHub Actions (build, test, visual diff, size budget, release) |
| Release           | Changesets + automated npm publish + provenance                 |

---

## 4. Monorepo Layout

```
vitecharts/
├─ packages/
│  ├─ core/                 @vitecharts/core      — engine, no framework deps
│  ├─ charts/               @vitecharts/charts    — chart-type modules (lazy)
│  ├─ themes/               @vitecharts/themes    — built-in + tokens
│  ├─ react/                @vitecharts/react
│  ├─ vue/                  @vitecharts/vue
│  ├─ svelte/               @vitecharts/svelte
│  ├─ angular/              @vitecharts/angular
│  ├─ solid/                @vitecharts/solid
│  ├─ wc/                   @vitecharts/wc        — <vitecharts-chart> web component
│  ├─ compat-apex/          @vitecharts/compat-apex — ApexCharts config shim (§9)
│  └─ export/               @vitecharts/export    — png/svg/csv/json/pdf
├─ apps/
│  ├─ docs/                 VitePress site + playground
│  └─ sandbox/              dev harness for every chart type
├─ e2e/                     Playwright specs + visual snapshots
├─ LICENSE                  Apache-2.0
├─ NOTICE
└─ ROADMAP.md
```

---

## 5. Feature Parity Matrix (target)

Tracking against ApexCharts' published feature set. ✅ shipped · 🚧 in progress · ⬜ planned.

### Chart types

| Type                             | Status |
| -------------------------------- | :----: |
| Line                             |   🚧   |
| Area (incl. stacked)             |   ⬜   |
| Spline / smooth                  |   ⬜   |
| Column / Bar (grouped/stack)     |   ⬜   |
| 100% stacked                     |   ⬜   |
| Range bar / range area           |   ⬜   |
| Bar with negative values         |   ⬜   |
| Candlestick (OHLC)               |   ⬜   |
| Boxplot                          |   ⬜   |
| Scatter                          |   ⬜   |
| Bubble                           |   ⬜   |
| Heatmap                          |   ⬜   |
| Treemap                          |   ⬜   |
| Pie / Donut                      |   ⬜   |
| Radial bar / gauge               |   ⬜   |
| Radar                            |   ⬜   |
| Polar area                       |   ⬜   |
| Funnel / Pyramid                 |   ⬜   |
| Timeline / Rangebar (Gantt-lite) |   ⬜   |
| Slope                            |   ⬜   |
| Sparkline (inline)               |   ⬜   |
| Combo / Mixed                    |   ⬜   |
| Synced / brush charts            |   ⬜   |

### Interaction & UX

| Feature                                        | Status |
| ---------------------------------------------- | :----: |
| Animations: entrance / update / morph          |   🚧   |
| Dynamic data update (streaming/append)         |   ⬜   |
| Tooltip (shared, custom, fixed)                |   ⬜   |
| Crosshairs / markers                           |   ⬜   |
| Legend (interactive toggle, positions)         |   ⬜   |
| Zoom (x/y/xy) + pan                            |   ⬜   |
| Brush / scrubbing + synced charts              |   ⬜   |
| Selection + range select events                |   ⬜   |
| Toolbar (zoom, pan, reset, export menu)        |   ⬜   |
| Annotations (x/y/point/image/text)             |   ⬜   |
| Data labels                                    |   ⬜   |
| Gradients, patterns, dropshadow                |   ⬜   |
| Responsive breakpoints                         |   ⬜   |
| Themes (light/dark/custom palettes)            |   ⬜   |
| Locales / i18n number+date formatting          |   ⬜   |
| RTL                                            |   ⬜   |
| Accessibility (keyboard, ARIA, reduced-motion) |   ⬜   |

### Export

| Format         | Status |
| -------------- | :----: |
| SVG            |   ⬜   |
| PNG            |   ⬜   |
| CSV            |   ⬜   |
| JSON / config  |   ⬜   |
| PDF (optional) |   ⬜   |

---

## 6. Phased Plan

Each phase ends with a tagged pre-release, updated docs, and green CI (incl. visual diffs).
Phases are sequenced so there's a runnable, demo-able artifact as early as possible.

### Phase 0 — Foundations _(scaffold & decisions)_ — ✅ COMPLETE

**Goal:** repo that builds, tests, lints, and renders a single hard-coded line chart.

- Init pnpm monorepo + Turborepo; Vite library config for `@vitecharts/core`.
- TypeScript strict config, path aliases, shared tsconfig.
- LICENSE (Apache-2.0), NOTICE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.md.
- CI skeleton: install → typecheck → unit → build → size-budget.
- Spike: render Plot output, then re-take ownership of its SVG nodes for animation.
  Decide Plot-on-top vs D3-direct per mark. **Document the decision.**
- `Renderer` interface (SVG impl first), minimal scene graph, draw one static line.

**Exit criteria:** `pnpm build && pnpm test` green; sandbox shows a static line chart.

### Phase 1 — Core Engine — ✅ COMPLETE

**Goal:** the declarative spine everything else hangs off.

- ✅ Options → spec compiler: validation, deep-merge defaults, theme merge.
- ✅ Scale system wrapping D3 (linear, log, time, band, point, color/ordinal).
- ✅ Mark primitives (line, area, rect/bar, point, arc) on the `Renderer` abstraction.
- ✅ Reactive store (signals) + lifecycle: `create → render → update → resize → destroy`.
- ✅ Resize handling (ResizeObserver), devicePixelRatio-aware Canvas backend stub.
- ✅ Public imperative API: `new Chart(el, options)`, `.update()`, `.updateSeries()`,
  `.setData()`, `.appendData()`, `.destroy()`.

**Exit criteria:** create a chart, mutate options/data imperatively, see it re-render. ✅
_31 unit tests across signals, scales, marks, compiler, Chart API, and the Canvas stub._

### Phase 2 — Animation Engine — ✅ CORE COMPLETE

**Goal:** the "Apex feel."

- ✅ Tween core: easing fns + spring solver; per-frame scheduler (rAF), batching.
- ✅ Enter choreography helpers per mark (line draw-on, marker pop, bar grow,
  arc sweep) expressed via `NodeHandle.set()` so they're renderer-agnostic.
- ✅ Apex-tuned presets (`apex` / `material` / `none`) as the timing/easing baseline.
- ✅ `prefers-reduced-motion` → disabled mode. Per-chart `animate` config
  (preset, duration, easing, delay, stagger, dynamic).
- ✅ Line chart: staggered draw-on + marker pop on mount; tweens cancelled on
  redraw/destroy so streaming updates stay clean.

**Deferred (intentionally, with reasons):**

- ⏭️ **FLIP update-morph** (smooth value interpolation on data change). The current
  clear-and-redraw model snaps updates; true morphing needs keyed node retention.
  Folding this in alongside the retained-node work in Phase 9.
- ⏭️ **bar grow / arc/donut sweep** are built + unit-tested as helpers but only become
  visible once the bar (Phase 3) and pie/donut (Phase 6) chart types exist.
- ⏭️ **Visual-regression baselines** (Playwright) — deferred until more chart types
  exist so the snapshot suite is worth standing up once.

**Exit criteria:** line draw-on + marker pop on mount, live-updating line, all honoring
reduced-motion. ✅ _(bar grow / donut sweep verified via unit tests pending their chart types.)_

### Phase 3 — Cartesian Chart Pack

**Goal:** the workhorse charts, production quality.

- Line, spline, area (stacked, 100% stacked), column/bar (grouped, stacked, negative),
  range bar/area, scatter, bubble, combo/mixed.
- Axes: multi-axis, log, time, category; ticks, gridlines, formatting hooks.
- Data labels, markers, gradients/patterns/fills, dashed/stroke styling.
- Sparkline mode (chromeless inline charts).

**Exit criteria:** all cartesian types in the sandbox with theming + animation + labels.

### Phase 4 — Interaction Layer

**Goal:** tooltips, zoom/pan, crosshairs, legend, toolbar.

- Hit-testing (quadtree for points; band lookups for bars/time).
- Tooltip system: shared/individual, follow-cursor/fixed, fully custom render slot.
- Crosshairs + axis markers.
- Interactive legend (toggle series, hover-highlight, positions, scrollable).
- Zoom (x/y/xy), pan, double-click reset; wheel + drag-rect select.
- Toolbar component (hamburger/menu) with zoom/pan/reset + export hooks.
- Event bus: `dataPointSelection`, `zoomed`, `legendClick`, `markerClick`, etc.

**Exit criteria:** fully interactive cartesian charts matching Apex interaction UX.

### Phase 5 — Brushing, Scrubbing & Sync

**Goal:** the brush/range-selector experience and synced charts.

- Brush chart: a small overview chart controlling a detail chart's x-range.
- Draggable/resizable selection window with momentum + snap.
- Scrubbing playhead (time series): drag to inspect, optional playback animation.
- Chart sync groups: shared crosshair + tooltip + zoom across multiple charts by `group` id.

**Exit criteria:** Apex-style brush+detail demo and a synced multi-chart dashboard.

### Phase 6 — Radial, Hierarchical & Statistical Pack

**Goal:** the rest of the chart catalog.

- Pie, donut (with total/center label), radial bar/gauge, polar area, radar.
- Candlestick + OHLC, boxplot (statistical transforms).
- Heatmap, treemap, funnel/pyramid, timeline/rangebar, slope.
- Reuse animation choreography (arc sweep, cell fade, etc.).

**Exit criteria:** parity matrix §5 chart types all ✅ or explicitly deferred.

### Phase 7 — Annotations, Themes & Export

**Goal:** finishing polish + outputs.

- Annotations: x/y lines, regions, points, text, images; draggable (optional).
- Theme system: tokens, light/dark, palette presets, per-chart overrides, CSS-var bridge.
- Locales/i18n: number + date formatting, RTL.
- `@vitecharts/export`: SVG (true vector), PNG (rasterize), CSV/JSON data, optional PDF.
  Export menu wired into the toolbar; programmatic `chart.export(...)` API.

**Exit criteria:** themed, annotated chart exports to all formats; i18n+RTL demo.

### Phase 8 — Framework Adapters

**Goal:** idiomatic packages per framework, all sharing core.

- React (`@vitecharts/react`): `<Chart />`, hooks, ref to imperative API, StrictMode-safe.
- Vue 3 (`@vitecharts/vue`): SFC component, props reactivity, `v-model`-friendly.
- Svelte (`@vitecharts/svelte`): component + actions; Svelte 5 runes support.
- Angular (`@vitecharts/angular`): standalone component + module.
- Solid (`@vitecharts/solid`): signals-native binding.
- Web Component (`@vitecharts/wc`): `<vitecharts-chart>` for any/no framework.
- Adapter contract test suite run against every adapter (same scenarios, parity guaranteed).

**Exit criteria:** identical demo app implemented in each framework from one core.

### Phase 9 — Performance & Accessibility Hardening

**Goal:** fast and inclusive.

- Canvas backend for dense series; auto-switch heuristic + manual override.
- Virtualization/downsampling (LTTB) for large series; web-worker layout (optional).
- Size budgets enforced in CI; per-chart-type lazy chunks verified tree-shakeable.
- Full keyboard navigation, ARIA roles/labels, screen-reader data table fallback,
  focus management, high-contrast theme, reduced-motion audited everywhere.
- Benchmarks vs ApexCharts published in docs.

**Exit criteria:** 100k-point scatter interactive at 60fps; axe + manual a11y pass.

### Phase 10 — Compat, Docs & 1.0

**Goal:** adoption on-ramps and release.

- `@vitecharts/compat-apex`: translate an ApexCharts options object → ViteCharts spec (best-effort,
  documented coverage table) to ease migration.
- VitePress docs: guides, full API reference (typedoc), live playground with code export,
  per-chart cookbook, migration guide, theming guide, a11y guide.
- Examples gallery mirroring Apex's demo set.
- Stabilize public API, semver policy, deprecation policy.
- `v1.0.0`: changesets release, provenance, npm publish, announcement.

**Exit criteria:** 1.0 published; docs live; parity matrix green or consciously deferred.

### Post-1.0 (backlog)

Maps/geo, 3D, advanced Gantt, dashboard layout helpers, server-side rendering of static
PNG/SVG, AI-assisted "describe a chart" config, Figma export.

---

## 7. Public API Sketch

A taste of the "better than Apex" API — typed, declarative, with an imperative escape hatch.

```ts
import { Chart } from '@vitecharts/core';

const chart = new Chart('#el', {
  type: 'line',
  data: sales, // array of rows OR series objects
  x: 'date', // accessor key or fn (row) => value
  series: [
    { y: 'revenue', name: 'Revenue', color: 'indigo', curve: 'spline' },
    { y: 'cost', name: 'Cost', type: 'area' }, // per-series override = combo
  ],
  axes: { x: { type: 'time' }, y: { format: '$,.0f' } },
  animate: { enabled: true, preset: 'apex', speed: 800 },
  tooltip: { shared: true },
  toolbar: { export: ['svg', 'png', 'csv'], zoom: true },
  brush: { target: '#detail' }, // scrubbing/sync
  theme: 'dark',
});

chart.appendData([{ date: '2026-06-03', revenue: 1200, cost: 800 }]); // animated stream
await chart.export('png', { scale: 2 });
```

```tsx
// React adapter — same options, idiomatic.
<Chart
  type="bar"
  data={data}
  x="month"
  series={[{ y: 'units' }]}
  animate={{ preset: 'apex' }}
  onPointClick={(p) => select(p)}
/>
```

---

## 8. Animation Strategy (the "feel")

ApexCharts' character comes from: line draw-on, bars growing from the baseline, arc sweeps,
smooth axis rescale on update, and tasteful easing on hover/legend toggle. To reproduce it:

- **Enter:** path-length stroke-dashoffset for lines; height/scale-from-baseline for bars;
  angle sweep for arcs; staggered delays across series/points.
- **Update:** FLIP — record old geometry, apply new, interpolate the delta; values tween
  with spring or eased interpolation; axis ticks cross-fade and slide.
- **Exit:** reverse of enter, then remove.
- **Hover/select:** quick opacity/scale/stroke transitions on the active datum, dim others.
- **Streaming:** shift-and-append without a full re-layout; reuse node pool.
- Encapsulate Apex's defaults as the `apex` preset; expose `material`, `none`, and custom.

---

## 9. ApexCharts Compatibility Adapter

To lower migration cost without polluting the core API:

- `@vitecharts/compat-apex` accepts an ApexCharts `options` object and returns a ViteCharts spec.
- Maintain a **coverage table** (supported / partial / unsupported config keys).
- Ship a `<ApexChart>`-shaped React/Vue component for near drop-in replacement.
- Codemod (optional) for common import/usage rewrites.

This is best-effort and explicitly _not_ a guarantee of 1:1 behavior.

---

## 10. Quality Gates (every PR)

- Typecheck (strict) + ESLint + Prettier clean.
- Unit tests (Vitest) for compiler, scales, animation math, transforms.
- E2E + visual regression (Playwright) for each chart type & interaction.
- Bundle size budget per package (fails CI on regression).
- `publint` + `arethetypeswrong` for package export correctness.
- a11y checks (axe) on representative charts.
- Docs examples must compile.

---

## 11. Testing Strategy

| Layer             | Tool          | What                                                   |
| ----------------- | ------------- | ------------------------------------------------------ |
| Unit              | Vitest        | spec compiler, scales, tween/spring, transforms, utils |
| Component         | Vitest+JSDOM  | adapter mount/update/unmount, prop reactivity          |
| Visual regression | Playwright    | per-chart-type pixel snapshots across themes           |
| Interaction e2e   | Playwright    | tooltip, zoom, brush, legend toggle, export download   |
| Performance       | bench harness | frame timing on dense datasets, memory                 |
| Cross-framework   | shared suite  | identical scenarios run through every adapter          |

---

## 12. Licensing & Compliance

- Project license: **Apache-2.0** (`LICENSE` + `NOTICE`, SPDX headers in sources).
- All dependencies must be Apache-2.0-compatible (MIT / BSD / ISC / Apache-2.0).
  - D3 modules → ISC ✅ · Observable Plot → ISC ✅ · Vite → MIT ✅ · Vitest/Playwright → MIT ✅.
- Add an automated license-check in CI (e.g. `license-checker`) to fail on incompatibles.
- `NOTICE` attributes Observable Plot and D3; no Apache-incompatible (GPL/AGPL) deps.
- Do **not** copy ApexCharts' (MIT) source; reference behavior/UX only and reimplement.
  (MIT is permissive, but we keep a clean-room boundary to avoid license entanglement and
  to justify our own Apache-2.0 grant.)

---

## 13. Milestones & Sequencing

| Milestone | Phases | Demo-able outcome                                  |
| --------- | ------ | -------------------------------------------------- |
| M1        | 0–2    | Animated line/bar/donut, imperative API            |
| M2        | 3–4    | Full cartesian pack, interactive (tooltip/zoom)    |
| M3        | 5–6    | Brush/scrub/sync + complete chart catalog          |
| M4        | 7–8    | Themes/annotations/export + all framework adapters |
| M5        | 9–10   | Hardened, documented, **v1.0**                     |

_(Durations intentionally omitted — sequence and exit criteria drive progress, not dates.)_

---

## 14. Risks & Open Questions

- **Plot-on-top vs D3-direct.** Plot renders static SVG; owning nodes for animation may
  fight its model. Phase 0 spike decides where Plot helps vs where we drop to D3. _(highest risk)_
- **Animation perf** with thousands of animated nodes → may force Canvas + node pooling earlier.
- **Export fidelity** of foreignObject/HTML tooltips into PNG/PDF (rasterization edge cases).
- **Adapter drift** — mitigated by the shared cross-framework contract suite.
- **Scope creep** across 20+ chart types — the parity matrix is the contract; defer
  explicitly rather than half-ship.
- **SSR/hydration** for adapters (esp. React Server Components / Nuxt) — design lifecycle
  to be SSR-safe from Phase 1.

---

## 15. Immediate Next Actions (Phase 0 kickoff)

1. Scaffold pnpm monorepo + Turborepo; add `LICENSE` (Apache-2.0) + `NOTICE`.
2. Configure Vite library build + `vite-plugin-dts` for `@vitecharts/core`.
3. Build the **Plot-ownership spike** and write up the rendering decision.
4. Define the `Renderer` interface + SVG backend; draw one static line chart in the sandbox.
5. Stand up CI (typecheck → test → build → size budget) and visual-snapshot harness.

```

```
