// Entry point
export { Chart } from './chart.js';

// Renderers
export { SvgRenderer } from './renderer/svg.js';
export { CanvasRenderer } from './renderer/canvas.js';
export type { Renderer, NodeHandle, Attrs } from './renderer/types.js';

// Spec compiler
export { compileSpec, DEFAULT_PADDING } from './spec/compile.js';

// Scales
export { buildScale, buildColorScale, type PositionScale, type ScaleType } from './scales/index.js';

// Marks
export {
  drawLine,
  linePath,
  drawArea,
  areaPath,
  drawPoints,
  drawBar,
  drawArc,
  arcPath,
  curveFor,
} from './marks/index.js';
export type {
  PixelPoint,
  LineStyle,
  AreaStyle,
  PointStyle,
  RectStyle,
  ArcStyle,
  AreaPoint,
  BarRect,
  ArcConfig,
} from './marks/index.js';

// Reactive store
export { signal, effect, computed, type Signal } from './reactive/signal.js';

// Theme + palette
export { resolveTheme, lightTheme, darkTheme } from './theme.js';
export type { ResolvedTheme, ThemeName, ThemeOption } from './theme.js';
export { DEFAULT_COLORS } from './palette.js';

// Chart registry
export { registry } from './charts/registry.js';

// Public types
export type {
  ChartOptions,
  ChartTypeName,
  CurveType,
  SeriesOption,
  AxisOption,
  Padding,
  CompiledSpec,
  ResolvedSeries,
  ResolvedAxis,
  ChartType,
  ChartContext,
  Row,
} from './types.js';

// Utilities
export { deepMerge, type DeepPartial } from './util/merge.js';
