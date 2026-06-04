// Entry point. This module registers every built-in chart type on import, so
// `new Chart(el, { type: 'line' })` works zero-config. For a tree-shakeable
// build, import from `@vitecharts/core/lean` and registerCharts(...) only what
// you use.
import { registerCharts } from './charts/registry.js';
import { cartesian } from './charts/cartesian.js';
import { radial } from './charts/radial.js';
import { funnel } from './charts/funnel.js';
import { heatmap } from './charts/heatmap.js';

registerCharts(cartesian, radial, funnel, heatmap);

export { Chart } from './chart.js';

// Renderers
export { SvgRenderer } from './renderer/svg.js';
export { CanvasRenderer } from './renderer/canvas.js';
export type { Renderer, NodeHandle, Attrs, GradientStop } from './renderer/types.js';

// Spec compiler
export { compileSpec, DEFAULT_PADDING } from './spec/compile.js';

// Export utilities
export { serializeSvg, svgToPngDataUrl, toCSV, toJSON, downloadFile } from './export/index.js';

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

// Animation engine
export {
  scheduler,
  tween,
  createSpring,
  resolveAnimation,
  prefersReducedMotion,
  polylineLength,
  animateDrawOn,
  animateAttr,
  animateFadeIn,
  animateBarGrow,
  animateArcSweep,
  EASINGS,
  type TweenHandle,
  type TweenOptions,
  type SpringOptions,
  type SpringStep,
  type AnimationPreset,
  type AnimationOption,
  type AnimateOption,
  type AnimationConfig,
  type EasingFn,
  type EasingName,
} from './anim/index.js';

// Theme + palette
export { resolveTheme, themeFromCss, lightTheme, darkTheme } from './theme.js';
export type { ResolvedTheme, ThemeName, ThemeOption } from './theme.js';
export { DEFAULT_COLORS } from './palette.js';

// Chart registry + registration API (plus the registrable plugins)
export { registry, registerChart, registerCharts, type ChartPlugin } from './charts/registry.js';
export { cartesian, cartesianChart } from './charts/cartesian.js';
export { radial, pieChart, polarAreaChart, radialBarChart, radarChart } from './charts/radial.js';
export { funnel, funnelChart } from './charts/funnel.js';
export { heatmap, heatmapChart } from './charts/heatmap.js';

// Interaction + events
export { Emitter } from './events.js';
export { Tooltip } from './interaction/tooltip.js';
export { Legend, type LegendPosition } from './interaction/legend.js';
export { InteractionController } from './interaction/controller.js';
export { BrushController } from './interaction/brush.js';
export { ZoomController } from './interaction/zoom.js';
export { Toolbar, type ExportFormat } from './interaction/toolbar.js';
export { joinSyncGroup, broadcastShow, broadcastHide, type SyncPeer } from './interaction/sync.js';
export type {
  PlotPoint,
  XGroup,
  InteractionModel,
  ChartEventMap,
  TooltipRenderer,
} from './interaction/types.js';

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
  ChartAnimation,
  TooltipOption,
  LegendOption,
  Annotation,
  Row,
} from './types.js';

// Utilities
export { deepMerge, type DeepPartial } from './util/merge.js';
export { lttb, type XY } from './util/downsample.js';
