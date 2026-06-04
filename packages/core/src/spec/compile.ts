import { resolveTheme } from '../theme.js';
import type { AxisOption, ChartOptions, CompiledSpec, Padding, ResolvedAxis } from '../types.js';

export const DEFAULT_PADDING: Padding = { top: 20, right: 24, bottom: 32, left: 48 };

function fail(message: string): never {
  throw new Error(`ViteCharts: ${message}`);
}

function validate(options: ChartOptions): void {
  if (!options || typeof options !== 'object') fail('options must be an object');
  if (!options.type) fail('`type` is required');
  if (!Array.isArray(options.data)) fail('`data` must be an array');
  if (typeof options.x !== 'string') fail('`x` must be a string key');
  if (!Array.isArray(options.series) || options.series.length === 0) {
    fail('`series` must be a non-empty array');
  }
  options.series.forEach((s, i) => {
    if (!s || typeof s.y !== 'string') fail(`series[${i}].y must be a string key`);
  });
}

function resolveAxis(axis: AxisOption | undefined, defaultTicks: number): ResolvedAxis {
  return {
    type: axis?.type,
    ticks: axis?.ticks ?? defaultTicks,
    min: axis?.min,
    max: axis?.max,
    format: axis?.format,
  };
}

/**
 * Normalize user options into a fully-resolved {@link CompiledSpec}: validate,
 * merge defaults, resolve the theme, and assign series colors. Layout-dependent
 * values (width/height) are resolved later, at render time, by the Chart.
 */
export function compileSpec(options: ChartOptions): CompiledSpec {
  validate(options);

  const theme = resolveTheme(options.theme, options.colors);

  const series = options.series.map((s, i) => {
    const type = s.type ?? options.type;
    return {
      y: s.y,
      name: s.name ?? s.y,
      color: s.color ?? theme.colors[i % theme.colors.length] ?? '#000000',
      type,
      curve: s.curve ?? ('linear' as const),
      fillOpacity: s.fillOpacity ?? (type === 'area' ? 0.25 : 1),
      size: s.size,
      gradient: s.gradient ?? false,
      dash: s.dash,
      open: s.open,
      high: s.high,
      low: s.low,
      close: s.close,
      q1: s.q1,
      median: s.median,
      q3: s.q3,
      hidden: false,
    };
  });

  const sparkline = options.sparkline ?? false;
  const padding = sparkline
    ? { top: 2, right: 2, bottom: 2, left: 2 }
    : { ...DEFAULT_PADDING, ...options.padding };

  return {
    type: options.type,
    data: [...options.data],
    x: options.x,
    series,
    padding,
    xAxis: resolveAxis(options.axes?.x, 6),
    yAxis: resolveAxis(options.axes?.y, 5),
    theme,
    markers: options.markers ?? false,
    stacked: options.stack ?? false,
    horizontal: options.horizontal ?? false,
    innerRadius: options.innerRadius ?? (options.type === 'donut' ? 0.6 : 0),
    annotations: options.annotations ?? [],
    dataLabels: options.dataLabels ?? false,
    sparkline,
  };
}
