import type { ChartType } from '../types.js';
import { cartesianChart } from './cartesian.js';
import { funnelChart } from './funnel.js';
import { heatmapChart } from './heatmap.js';
import { pieChart, polarAreaChart, radarChart, radialBarChart } from './radial.js';

/**
 * Chart-type registry. Each phase registers more types here; the {@link Chart}
 * looks a type up by name so types stay tree-shakeable behind lazy imports later.
 *
 * Every cartesian type shares one renderer — per-series `type` enables combos.
 */
export const registry: Record<string, ChartType> = {
  line: cartesianChart,
  area: cartesianChart,
  bar: cartesianChart,
  scatter: cartesianChart,
  candlestick: cartesianChart,
  boxplot: cartesianChart,
  rangeBar: cartesianChart,
  rangeArea: cartesianChart,
  pie: pieChart,
  donut: pieChart, // innerRadius (default 0.6) drives the hole
  polarArea: polarAreaChart,
  radialBar: radialBarChart,
  radar: radarChart,
  funnel: funnelChart,
  heatmap: heatmapChart,
};
