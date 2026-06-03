import type { AnimateOption, AnimationConfig } from './anim/presets.js';
import type { TweenHandle } from './anim/tween.js';
import type { LegendPosition } from './interaction/legend.js';
import type { SceneSink, TooltipRenderer } from './interaction/types.js';
import type { Renderer } from './renderer/types.js';
import type { ScaleType } from './scales/index.js';
import type { ResolvedTheme, ThemeOption } from './theme.js';

export type TooltipOption = boolean | { shared?: boolean; render?: TooltipRenderer };
export type LegendOption = boolean | { position?: LegendPosition };

export type Row = Record<string, unknown>;

/** Chart types the registry can render. Grows per phase. */
export type ChartTypeName =
  | 'line'
  | 'area'
  | 'bar'
  | 'scatter'
  | 'pie'
  | 'donut'
  | 'polarArea'
  | 'radialBar'
  | 'radar'
  | 'candlestick'
  | 'boxplot'
  | 'rangeBar'
  | 'rangeArea'
  | 'funnel'
  | 'heatmap';

/** Line interpolation. */
export type CurveType = 'linear' | 'smooth' | 'step' | 'basis';

// --------------------------------------------------------------------------
// Public options (what a user passes)
// --------------------------------------------------------------------------

export interface SeriesOption {
  /** Key in each row holding this series' y value. */
  y: string;
  /** Display name (defaults to the key). */
  name?: string;
  /** Stroke/fill color (defaults to the theme palette). */
  color?: string;
  /** Per-series type override (enables combo charts). */
  type?: ChartTypeName;
  /** Line interpolation for this series. */
  curve?: CurveType;
  /** Fill opacity for area/bar marks. */
  fillOpacity?: number;
  /** Key holding a per-point size value (turns scatter into a bubble chart). */
  size?: string;
  /** Fade area/bar fills with a vertical gradient. */
  gradient?: boolean;
  /** SVG `stroke-dasharray` for a dashed line, e.g. `"6 4"`. */
  dash?: string;
  // Multi-value keys for financial/statistical/range types:
  /** Candlestick open key. */
  open?: string;
  /** Candlestick/boxplot high (max) key. */
  high?: string;
  /** Candlestick/boxplot low (min) key. */
  low?: string;
  /** Candlestick close key. */
  close?: string;
  /** Boxplot lower-quartile key. */
  q1?: string;
  /** Boxplot median key. */
  median?: string;
  /** Boxplot upper-quartile key. */
  q3?: string;
}

export interface AxisOption {
  /** Force a scale type instead of inferring from the data. */
  type?: ScaleType;
  /** Target number of ticks. */
  ticks?: number;
  /** Hard domain minimum. */
  min?: number;
  /** Hard domain maximum. */
  max?: number;
  /** Format a raw value into a tick label. */
  format?: (value: unknown) => string;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A chart annotation drawn over the plot area. */
export interface Annotation {
  type: 'xLine' | 'yLine' | 'region' | 'point';
  /** x value (xLine / point) or region x-start. */
  x?: unknown;
  /** region x-end. */
  x2?: unknown;
  /** y value (yLine / point) or region y-start. */
  y?: number;
  /** region y-end. */
  y2?: number;
  label?: string;
  color?: string;
}

export interface ChartOptions {
  type: ChartTypeName;
  data: ReadonlyArray<Row>;
  /** Key in each row holding the x value. */
  x: string;
  series: SeriesOption[];
  /** Fixed width; omit to size from the container (responsive). */
  width?: number;
  /** Fixed height (default 360). */
  height?: number;
  padding?: Partial<Padding>;
  axes?: { x?: AxisOption; y?: AxisOption };
  /** Palette override (wins over the theme palette). */
  colors?: string[];
  /** Theme name or partial override. */
  theme?: ThemeOption;
  /** Animation config: `false`, a preset name, or a detailed object. */
  animate?: AnimateOption;
  /** Draw point markers on each series (line/area). */
  markers?: boolean;
  /** Stack area/bar series instead of overlaying/grouping them. */
  stack?: boolean;
  /** Tooltip: `true`/`false`, or `{ shared, render }`. Defaults to enabled. */
  tooltip?: TooltipOption;
  /** Interactive legend: `true`/`false`, or `{ position }`. Defaults to disabled. */
  legend?: LegendOption;
  /** Show a crosshair line on hover. Defaults to enabled when the tooltip is. */
  crosshair?: boolean;
  /** Inner radius as a fraction of the outer radius (0–1) for pie/donut/radial. */
  innerRadius?: number;
  /** Annotations drawn over the plot (x/y lines, regions, points). */
  annotations?: Annotation[];
  /** Enable drag-to-select brushing; emits `brushSelection` events. */
  brush?: boolean;
  /** Sync group id — charts sharing it mirror hover crosshair/tooltip. */
  group?: string;
  /** Accessible label for the chart (sets role="img" + aria-label + <title>). */
  ariaLabel?: string;
  /** Draw value labels on each datum. */
  dataLabels?: boolean;
  /** Chromeless inline mode — no axes, grid, padding, or tooltip. */
  sparkline?: boolean;
  /** Enable wheel/selection zoom on a numeric/time x axis. */
  zoom?: boolean;
  /** Enable drag-to-pan (numeric/time x axis). */
  pan?: boolean;
  /** Show the toolbar (zoom controls + export menu). */
  toolbar?: boolean;
}

// --------------------------------------------------------------------------
// Compiled spec (internal, produced by the spec compiler)
// --------------------------------------------------------------------------

export interface ResolvedSeries {
  y: string;
  name: string;
  color: string;
  type: ChartTypeName;
  curve: CurveType;
  fillOpacity: number;
  size?: string;
  gradient: boolean;
  dash?: string;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  q1?: string;
  median?: string;
  q3?: string;
  hidden: boolean;
}

export interface ResolvedAxis {
  type?: ScaleType;
  ticks: number;
  min?: number;
  max?: number;
  format?: (value: unknown) => string;
}

export interface CompiledSpec {
  type: ChartTypeName;
  data: Row[];
  x: string;
  series: ResolvedSeries[];
  padding: Padding;
  xAxis: ResolvedAxis;
  yAxis: ResolvedAxis;
  theme: ResolvedTheme;
  markers: boolean;
  stacked: boolean;
  innerRadius: number;
  annotations: Annotation[];
  dataLabels: boolean;
  sparkline: boolean;
}

/**
 * Animation surface passed to chart types each frame. `enter` is true on the
 * first render (play the full entrance); `track` registers tween handles so the
 * Chart can cancel them on the next redraw or on destroy.
 */
export interface ChartAnimation {
  config: AnimationConfig;
  enter: boolean;
  /** True on data updates when update-morph should play (not first render). */
  dynamic: boolean;
  /** Geometry from the previous frame, keyed per mark (FLIP morph source). */
  prev: Map<string, number[]> | null;
  /** Sink for this frame's geometry, to morph from next time. */
  snapshot: Map<string, number[]>;
  track(handle: TweenHandle | null): void;
}

// --------------------------------------------------------------------------
// Chart-type contract
// --------------------------------------------------------------------------

/** Everything a chart type needs to draw a single frame. */
export interface ChartContext {
  renderer: Renderer;
  width: number;
  height: number;
  spec: CompiledSpec;
  animation: ChartAnimation;
  /** Sink for the interaction model (hit-test points + bounds). */
  scene: SceneSink;
}

export interface ChartType {
  render(ctx: ChartContext): void;
}
