import type { Renderer } from './renderer/types.js';

export type Row = Record<string, unknown>;

export interface SeriesOption {
  /** Key in each row holding this series' y value. */
  y: string;
  /** Display name (defaults to the key). */
  name?: string;
  /** Stroke color (defaults to the theme palette). */
  color?: string;
}

export interface AxisOption {
  /** Number of ticks to aim for. */
  ticks?: number;
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
  /** Chart type. Phase 0 ships `'line'`; the registry grows per phase. */
  type: 'line';
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
  /** Color palette override. */
  colors?: string[];
}

/** Options after defaults have been merged in. */
export interface ResolvedOptions extends ChartOptions {
  padding: Padding;
  colors: string[];
}

/** Everything a chart type needs to draw a single frame. */
export interface ChartContext {
  renderer: Renderer;
  width: number;
  height: number;
  options: ResolvedOptions;
}

export interface ChartType {
  render(ctx: ChartContext): void;
}
