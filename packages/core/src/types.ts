import type { AnimateOption, AnimationConfig } from './anim/presets.js';
import type { TweenHandle } from './anim/tween.js';
import type { Renderer } from './renderer/types.js';
import type { ScaleType } from './scales/index.js';
import type { ResolvedTheme, ThemeOption } from './theme.js';

export type Row = Record<string, unknown>;

/** Chart types the registry can render. Grows per phase. */
export type ChartTypeName = 'line';

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
  /** Per-series type override (enables combo charts later). */
  type?: ChartTypeName;
  /** Line interpolation for this series. */
  curve?: CurveType;
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
  /** Draw point markers on each series. */
  markers?: boolean;
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
}

/**
 * Animation surface passed to chart types each frame. `enter` is true on the
 * first render (play the full entrance); `track` registers tween handles so the
 * Chart can cancel them on the next redraw or on destroy.
 */
export interface ChartAnimation {
  config: AnimationConfig;
  enter: boolean;
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
}

export interface ChartType {
  render(ctx: ChartContext): void;
}
