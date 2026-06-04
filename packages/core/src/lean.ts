// Tree-shakeable entry. Unlike `@vitecharts/core`, this registers NO chart types
// on import — you pull in only the families you register, so unused chart code
// is dropped by your bundler.
//
//   import { Chart, registerCharts, cartesian } from '@vitecharts/core/lean';
//   registerCharts(cartesian); // line / area / bar / scatter / candlestick / …
//   new Chart('#el', { type: 'line', data, x: 'm', series: [{ y: 'v' }] });

export { Chart } from './chart.js';
export { registry, registerChart, registerCharts, type ChartPlugin } from './charts/registry.js';

// Registrable plugins — import only what you need.
export { cartesian, cartesianChart } from './charts/cartesian.js';
export { radial, pieChart, polarAreaChart, radialBarChart, radarChart } from './charts/radial.js';
export { funnel, funnelChart } from './charts/funnel.js';
export { heatmap, heatmapChart } from './charts/heatmap.js';

// Public types (erased at build time — no runtime cost).
export type {
  ChartOptions,
  ChartTypeName,
  CurveType,
  SeriesOption,
  AxisOption,
  Padding,
  Annotation,
  ChartType,
  Row,
} from './types.js';
export type { ThemeOption } from './theme.js';
export type { AnimateOption } from './anim/presets.js';
