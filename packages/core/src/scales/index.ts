import { extent, max, min } from 'd3-array';
import { scaleBand, scaleLinear, scaleLog, scalePoint, scaleTime } from 'd3-scale';
import { isDate, isNumber } from '../util/guards.js';

export type ScaleType = 'linear' | 'log' | 'time' | 'band' | 'point' | 'ordinal';

/** A positional scale: maps a data value to a pixel coordinate. */
export interface PositionScale {
  type: ScaleType;
  /** Map a data value to a pixel position. */
  map(value: unknown): number;
  /** Tick values for axis rendering. */
  ticks(count?: number): unknown[];
  /** Band width in pixels (0 for continuous scales). */
  bandwidth: number;
  /** Default label formatter for a tick value. */
  format(value: unknown): string;
}

export interface ScaleOptions {
  /** Force a scale type instead of inferring from the data. */
  type?: ScaleType;
  /** Extend a continuous domain to include zero (used for value axes). */
  zero?: boolean;
  /** Hard domain minimum. */
  min?: number;
  /** Hard domain maximum. */
  max?: number;
  /** Inner padding for band/point scales. */
  padding?: number;
}

function inferType(values: unknown[]): ScaleType {
  if (values.length > 0 && values.every(isNumber)) return 'linear';
  if (values.length > 0 && values.every(isDate)) return 'time';
  return 'point';
}

/**
 * Build a positional scale from raw data values and a pixel range, inferring
 * the scale kind (numeric → linear, dates → time, otherwise categorical) unless
 * `opts.type` forces one.
 */
export function buildScale(
  values: unknown[],
  range: [number, number],
  opts: ScaleOptions = {},
): PositionScale {
  const type = opts.type ?? inferType(values);
  const [r0] = range;

  // Subsample a categorical domain to ~count labels so they don't overlap.
  const subsample = (domain: string[], count?: number): string[] => {
    const n = count ?? 8;
    if (domain.length <= n) return domain;
    const step = Math.ceil(domain.length / n);
    return domain.filter((_, i) => i % step === 0);
  };

  if (type === 'band') {
    const domain = [...new Set(values.map((v) => String(v)))];
    const scale = scaleBand<string>()
      .domain(domain)
      .range(range)
      .padding(opts.padding ?? 0.1);
    return {
      type,
      map: (v) => scale(String(v)) ?? r0,
      ticks: (count) => subsample(domain, count),
      bandwidth: scale.bandwidth(),
      format: (v) => String(v),
    };
  }

  if (type === 'point' || type === 'ordinal') {
    const domain = [...new Set(values.map((v) => String(v)))];
    const scale = scalePoint<string>()
      .domain(domain)
      .range(range)
      .padding(opts.padding ?? 0.5);
    return {
      type,
      map: (v) => scale(String(v)) ?? r0,
      ticks: (count) => subsample(domain, count),
      bandwidth: 0,
      format: (v) => String(v),
    };
  }

  if (type === 'time') {
    const dates = values.filter(isDate);
    const [lo, hi] = extent(dates);
    const dLo = opts.min != null ? new Date(opts.min) : (lo ?? new Date(0));
    const dHi = opts.max != null ? new Date(opts.max) : (hi ?? new Date());
    const scale = scaleTime().domain([dLo, dHi]).range(range);
    const fmt = scale.tickFormat();
    return {
      type,
      map: (v) => scale(v as Date),
      ticks: (count) => scale.ticks(count ?? 6),
      bandwidth: 0,
      format: (v) => fmt(v as Date),
    };
  }

  const nums = values.filter(isNumber);
  const dataMin = min(nums) ?? 0;
  const dataMax = max(nums) ?? 1;
  const lo = opts.min ?? (opts.zero ? Math.min(0, dataMin) : dataMin);
  const hi = opts.max ?? dataMax;

  if (type === 'log') {
    const scale = scaleLog()
      .domain([lo <= 0 ? 1 : lo, hi <= 0 ? 1 : hi])
      .range(range);
    return {
      type,
      map: (v) => scale(v as number),
      ticks: (count) => scale.ticks(count ?? 5),
      bandwidth: 0,
      format: (v) => String(v),
    };
  }

  // linear (with a degenerate-domain guard so a flat series still renders)
  const scale = scaleLinear()
    .domain(lo === hi ? [lo - 1, hi + 1] : [lo, hi])
    .range(range)
    .nice();
  return {
    type,
    map: (v) => scale(v as number),
    ticks: (count) => scale.ticks(count ?? 5),
    bandwidth: 0,
    format: (v) => String(v),
  };
}

/** Build an ordinal color scale mapping category keys to palette colors. */
export function buildColorScale(domain: string[], colors: string[]): (key: unknown) => string {
  const lookup = new Map<string, string>();
  domain.forEach((key, i) => lookup.set(key, colors[i % colors.length] ?? '#000000'));
  return (key) => lookup.get(String(key)) ?? colors[0] ?? '#000000';
}
