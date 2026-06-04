# @vitecharts/core

## 0.1.0

### Minor Changes

- e6cd903: Animation engine ("Apex feel").
  - Tween core: easing library + spring solver + a shared rAF scheduler with batching.
  - Renderer-agnostic choreography helpers (via `NodeHandle.set`): line draw-on,
    marker pop, bar grow, arc/donut sweep, fade.
  - Animation presets (`apex` / `material` / `none`) and a per-chart `animate` option
    (preset, duration, easing, delay, stagger, dynamic), honoring `prefers-reduced-motion`.
  - Line chart plays staggered draw-on + marker pop on mount; in-flight tweens are
    cancelled on redraw/destroy. New `markers` option.

- 2dbbdc8: Annotations + export.
  - Annotations drawn over the plot: `xLine`, `yLine`, `region`, and `point` (with
    optional labels), via a new `annotations` option.
  - Export API on `Chart`: `toSVG()`, `toPNG(scale)`, `toCSV()`, `toJSON()`, and
    `download(format)` for svg/png/csv/json.

- e932cd1: Brushing + chart sync.
  - `brush: true` enables drag-to-select over the plot and emits a `brushSelection`
    event with the data values (x0/x1) at the edges — wire it to another chart's
    `axes.x.min/max` for a brush→detail (scrubbing) view.
  - `group: '<id>'` syncs hover across charts: peers sharing the id mirror the
    crosshair + tooltip.

- 693f099: Cartesian chart pack.
  - Shared cartesian frame (scales + grid + axes) reused by all cartesian types.
  - New chart types: `area` (incl. stacked), `bar`/column (grouped + stacked,
    negative-aware), `scatter` (and bubble via a series `size` key).
  - Combo charts via per-series `type` override.
  - Per-series entrance animations: bar grow, area fade, line draw-on, point pop.
  - New options: `stack`, and series `fillOpacity` / `size`.

- b64de0e: Horizontal bars — set `horizontal: true` on a bar chart to put values on the x
  axis and categories on the y axis (grouped + stacked, with grow animation and
  data labels). Great for ranked/labelled comparisons.
- 05adc49: Initial core engine.
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

- b40b1eb: Interaction layer.
  - Chart types now emit an interaction model (plotted points grouped by x) for
    hit-testing.
  - Floating, theme-aware tooltip (shared) with a custom `render` slot.
  - Crosshair line on hover.
  - Interactive legend that toggles series visibility, with positions.
  - Typed event bus on `Chart`: `chart.on('pointerMove' | 'pointerLeave' |
'markerClick' | 'legendClick', …)`.
  - New options: `tooltip`, `legend`, `crosshair`.

- 8413459: Performance, accessibility, and ApexCharts compatibility.
  - core: LTTB downsampling automatically thins line series longer than ~2000
    points (preserving shape); exported as `lttb`.
  - core: accessibility — `role="img"`, `aria-label`, and a `<title>` on the SVG,
    with a new `ariaLabel` option (auto-generated fallback).
  - new package `@vitecharts/compat-apex` with `fromApex(apexOptions)` to translate
    an ApexCharts config into ViteCharts options (best-effort).

- 9a73461: Visual & UX polish:
  - **Responsive height** — charts now size to their container's height (not just
    width) when `height` is omitted, so they fit their box.
  - **Smooth crosshair & hover emphasis** — the crosshair line and highlight rings
    now glide between points via a CSS transform transition instead of snapping.
  - **Refined default palette** — a modern, indigo-led set that reads well in light
    and dark.
  - **No more overlapping axis labels** — categorical x axes subsample tick labels
    to ~the requested count.
  - **Smarter value axis** — only bar/area/range types force a zero baseline; line,
    scatter, candlestick, boxplot, and range fit tightly to the data.

- 58f8d72: Radial chart pack: `pie`, `donut` (with center total), `polarArea`, `radialBar`
  (concentric gauges), and `radar`. They share a radial geometry helper and reuse
  the arc-sweep / fade animations. New `innerRadius` option drives the donut hole.
- 18652d5: Statistical, financial, and hierarchical chart types: `candlestick` (OHLC),
  `boxplot`, `rangeBar`, `rangeArea`, `funnel`, and `heatmap` (with a continuous
  visualMap legend). Adds multi-value series keys (`open`/`high`/`low`/`close`,
  `q1`/`median`/`q3`).
- b828afb: Styling pack: gradient fills (`series.gradient`), dashed lines (`series.dash`),
  value `dataLabels`, chromeless `sparkline` mode, and proper null-value gaps
  (explicit `null` breaks the line). Adds a `gradient()` method to the renderer.
- 83e6edc: Tree-shakeable, registerable chart types.
  - The main `@vitecharts/core` entry still registers every chart type on import
    (zero-config — no change for existing users).
  - New **`@vitecharts/core/lean`** entry registers nothing; pull in only the chart
    families you `registerCharts(...)` and your bundler drops the rest.
  - New API: `registerChart(name, impl)`, `registerCharts(...plugins)`, and the
    registrable plugins `cartesian`, `radial`, `funnel`, `heatmap`.
  - The build now preserves the source module graph so chart types tree-shake.
    A line-only app is ~27–31 kB gzipped vs ~34 kB for the full catalog.

- 5e27867: Update-morph (FLIP), value count-up, and hover emphasis.
  - Bars now slide + resize from their previous geometry on data updates (the
    "bar-race" effect) via a per-frame geometry snapshot.
  - Data labels count up/down to the new value on update.
  - Hovering highlights the active point(s) with an emphasis ring.

  Adds `animateRectMorph` and `animateNumber` to the animation API.

- 02fbf47: Warm editorial theming + CSS-variable theming.
  - New **warm, light-first default theme** (terracotta-led palette, warm neutrals)
    with a warm dark theme. Light is the default; pass `theme: 'dark'` for dark.
  - Tooltips are now inverted for contrast and inherit theme tokens; chart labels
    use a monospace stack with tabular figures.
  - New **`theme: 'css'`** reads `--vc-grid` / `--vc-axis` / `--vc-ink-soft` /
    `--vc-surface` / `--vc-tooltip-bg/fg` / `--vc-font` and palette `--c1…--c12`
    from the container, so a host stylesheet can drive chart colors and charts
    follow a dark-mode class instantly. Exposed as `themeFromCss`.

  Fully customizable — `theme` still accepts `'light'`/`'dark'`/a partial object,
  and `colors` overrides the palette.

- 751bbd4: Zoom, pan, and a toolbar. New options `zoom`, `pan`, `toolbar`:
  - wheel-zoom and drag-pan on numeric/time x axes (data is filtered + the x axis
    clamps to the window)
  - drag-to-select zoom (selection-zoom) when `zoom` is on
  - a floating toolbar with zoom in/out/reset and an export menu (SVG/PNG/CSV/JSON)
  - imperative `chart.zoomIn() / zoomOut() / resetZoom()` and a `zoomed` event

### Patch Changes

- ffd8565: Reserve space for the legend when sizing the plot, so the SVG and a bottom/top
  (or left/right) legend fit the container together instead of the legend
  overflowing past it.
- 70a7582: Draw bars with sharp (square) corners — vertical bars, horizontal bars, range
  bars, and the boxplot box no longer have rounded corners.
