import {
  animateAttr,
  animateBarGrow,
  animateDrawOn,
  animateFadeIn,
  polylineLength,
} from '../anim/choreography.js';
import { drawArea, type AreaPoint } from '../marks/area.js';
import { drawBar } from '../marks/bar.js';
import { drawLine } from '../marks/line.js';
import type { PixelPoint } from '../marks/types.js';
import { buildScale, type PositionScale } from '../scales/index.js';
import { isNumber } from '../util/guards.js';
import type { ChartContext, ChartType, ResolvedSeries } from '../types.js';
import type { NodeHandle, Renderer } from '../renderer/types.js';
import type { InteractionModel, PlotPoint, XGroup } from '../interaction/types.js';

const MARKER_RADIUS = 4;
const BAR_GAP = 0.85; // fraction of the available slot a bar fills

interface Frame {
  x: PositionScale;
  y: PositionScale;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface StackPoint {
  xRaw: unknown;
  y0: number;
  y1: number;
}

/** Per-row y values used to size the value axis (flat, or stacked totals). */
function valueDomain(ctx: ChartContext, stacked: boolean): number[] {
  const { spec } = ctx;
  if (!stacked) {
    return spec.series.flatMap((s) => spec.data.map((r) => r[s.y]).filter(isNumber));
  }
  const pos = spec.data.map((row) =>
    spec.series.reduce((acc, s) => {
      const v = row[s.y];
      return acc + (isNumber(v) && v > 0 ? v : 0);
    }, 0),
  );
  const neg = spec.data.map((row) =>
    spec.series.reduce((acc, s) => {
      const v = row[s.y];
      return acc + (isNumber(v) && v < 0 ? v : 0);
    }, 0),
  );
  return [...pos, ...neg, 0];
}

/** Running stacked baselines per series, keyed by series y-key. */
function stackSeries(ctx: ChartContext): Map<string, StackPoint[]> {
  const { spec } = ctx;
  const result = new Map<string, StackPoint[]>();
  const running = spec.data.map(() => 0);
  for (const s of spec.series) {
    const points: StackPoint[] = [];
    spec.data.forEach((row, i) => {
      const v = row[s.y];
      const value = isNumber(v) ? v : 0;
      const y0 = running[i] ?? 0;
      const y1 = y0 + value;
      running[i] = y1;
      points.push({ xRaw: row[spec.x], y0, y1 });
    });
    result.set(s.y, points);
  }
  return result;
}

function drawFrame(ctx: ChartContext, bandX: boolean, stacked: boolean): Frame {
  const { renderer, width, height, spec } = ctx;
  const { padding, theme } = spec;
  const left = padding.left;
  const right = width - padding.right;
  const top = padding.top;
  const bottom = height - padding.bottom;

  const xValues = spec.data.map((r) => r[spec.x]);
  const x = buildScale(xValues, [left, right], {
    type: bandX ? 'band' : spec.xAxis.type,
    min: spec.xAxis.min,
    max: spec.xAxis.max,
  });
  const y = buildScale(valueDomain(ctx, stacked), [bottom, top], {
    type: spec.yAxis.type ?? 'linear',
    zero: true,
    min: spec.yAxis.min,
    max: spec.yAxis.max,
  });

  const label = (anchor: string) => ({
    'text-anchor': anchor,
    'font-size': 11,
    fill: theme.labelColor,
    'font-family': theme.fontFamily,
  });

  const grid = renderer.group({ class: 'vitecharts-grid' });
  for (const tick of y.ticks(spec.yAxis.ticks)) {
    const py = y.map(tick);
    renderer.line({ x1: left, x2: right, y1: py, y2: py, stroke: theme.gridColor }, grid);
    const text = spec.yAxis.format ? spec.yAxis.format(tick) : y.format(tick);
    renderer.text(text, { x: left - 8, y: py + 4, ...label('end') }, grid);
  }

  const xaxis = renderer.group({ class: 'vitecharts-xaxis' });
  renderer.line({ x1: left, x2: right, y1: bottom, y2: bottom, stroke: theme.axisColor }, xaxis);
  const center = x.bandwidth / 2;
  for (const tick of x.ticks(spec.xAxis.ticks)) {
    const px = x.map(tick) + center;
    const text = spec.xAxis.format ? spec.xAxis.format(tick) : x.format(tick);
    renderer.text(text, { x: px, y: bottom + 18, ...label('middle') }, xaxis);
  }

  return { x, y, left, right, top, bottom };
}

/** Map a row's x value to its mark center (band center for categorical scales). */
function centerX(frame: Frame, xRaw: unknown): number {
  return frame.x.map(xRaw) + frame.x.bandwidth / 2;
}

interface SeriesCtx {
  renderer: Renderer;
  frame: Frame;
  spec: ChartContext['spec'];
  animation: ChartContext['animation'];
  delay: number;
  /** Index of this series in the original (unfiltered) series list. */
  seriesIndex: number;
  /** Collect a plotted point for the interaction model. */
  collect: (point: PlotPoint) => void;
}

function record(
  sc: SeriesCtx,
  s: ResolvedSeries,
  xRaw: unknown,
  value: number,
  cx: number,
  cy: number,
): void {
  sc.collect({ seriesIndex: sc.seriesIndex, name: s.name, color: s.color, xRaw, value, cx, cy });
}

function linePoints(sc: SeriesCtx, s: ResolvedSeries): PixelPoint[] {
  const points: PixelPoint[] = [];
  for (const row of sc.spec.data) {
    const v = row[s.y];
    if (!isNumber(v)) continue;
    const cx = centerX(sc.frame, row[sc.spec.x]);
    const cy = sc.frame.y.map(v);
    points.push({ x: cx, y: cy });
    record(sc, s, row[sc.spec.x], v, cx, cy);
  }
  return points;
}

function drawMarkers(
  sc: SeriesCtx,
  s: ResolvedSeries,
  points: PixelPoint[],
  parent: NodeHandle,
): void {
  const { renderer, animation } = sc;
  const group = renderer.group({ class: 'vitecharts-markers' }, parent);
  points.forEach((p, j) => {
    const dot = renderer.circle(
      { cx: p.x, cy: p.y, r: MARKER_RADIUS, fill: s.color, stroke: '#ffffff', 'stroke-width': 1.5 },
      group,
    );
    if (animation.enter) {
      const popDelay = sc.delay + (j / Math.max(1, points.length)) * animation.config.duration;
      animation.track(
        animateAttr(dot, 'r', 0, MARKER_RADIUS, animation.config, { delay: popDelay }),
      );
    }
  });
}

function drawLineSeries(sc: SeriesCtx, s: ResolvedSeries, parent: NodeHandle): void {
  const points = linePoints(sc, s);
  const path = drawLine(sc.renderer, points, { stroke: s.color, width: 2, curve: s.curve }, parent);
  if (sc.animation.enter) {
    sc.animation.track(
      animateDrawOn(path, polylineLength(points), sc.animation.config, { delay: sc.delay }),
    );
  }
  if (sc.spec.markers) drawMarkers(sc, s, points, parent);
}

function drawAreaSeries(
  sc: SeriesCtx,
  s: ResolvedSeries,
  parent: NodeHandle,
  stacks: Map<string, StackPoint[]> | null,
): void {
  const { frame } = sc;
  const stack = stacks?.get(s.y);
  const areaPts: AreaPoint[] = [];
  const topPts: PixelPoint[] = [];

  sc.spec.data.forEach((row, i) => {
    const v = row[s.y];
    if (!isNumber(v)) return;
    const cx = centerX(frame, row[sc.spec.x]);
    const sp = stack?.[i];
    const y1 = frame.y.map(sp ? sp.y1 : v);
    const y0 = frame.y.map(sp ? sp.y0 : 0);
    areaPts.push({ x: cx, y: y1, y0 });
    topPts.push({ x: cx, y: y1 });
    record(sc, s, row[sc.spec.x], v, cx, y1);
  });

  const fill = drawArea(
    sc.renderer,
    areaPts,
    { fill: s.color, opacity: s.fillOpacity, curve: s.curve },
    parent,
  );
  const line = drawLine(sc.renderer, topPts, { stroke: s.color, width: 2, curve: s.curve }, parent);
  if (sc.animation.enter) {
    sc.animation.track(animateFadeIn(fill, sc.animation.config, { delay: sc.delay }));
    sc.animation.track(
      animateDrawOn(line, polylineLength(topPts), sc.animation.config, { delay: sc.delay }),
    );
  }
}

interface BarLayout {
  index: number;
  count: number;
}

function drawBarSeries(
  sc: SeriesCtx,
  s: ResolvedSeries,
  parent: NodeHandle,
  layout: BarLayout,
  stacks: Map<string, StackPoint[]> | null,
): void {
  const { frame, animation } = sc;
  const band = frame.x.bandwidth || 32;
  const baseline = frame.y.map(0);
  const stack = stacks?.get(s.y);
  const slot = stack ? band : band / layout.count;
  const barWidth = slot * BAR_GAP;

  sc.spec.data.forEach((row, i) => {
    const v = row[s.y];
    if (!isNumber(v)) return;
    const left = frame.x.map(row[sc.spec.x]);
    const sp = stack?.[i];
    const top = frame.y.map(sp ? sp.y1 : v);
    const bottom = frame.y.map(sp ? sp.y0 : 0);
    const slotLeft = stack ? left : left + layout.index * slot;
    const x = slotLeft + (slot - barWidth) / 2;
    const y = Math.min(top, bottom);
    const h = Math.abs(bottom - top);
    record(sc, s, row[sc.spec.x], v, x + barWidth / 2, top);
    const rect = drawBar(
      sc.renderer,
      { x, y, width: barWidth, height: h },
      { fill: s.color, opacity: s.fillOpacity, radius: 2 },
      parent,
    );
    if (animation.enter) {
      const grow = animateBarGrow(rect, y, h, baseline, animation.config, {
        delay: sc.delay + (i / Math.max(1, sc.spec.data.length)) * animation.config.duration * 0.5,
      });
      animation.track(grow);
    }
  });
}

function drawScatterSeries(sc: SeriesCtx, s: ResolvedSeries, parent: NodeHandle): void {
  const { frame, animation } = sc;
  const sizes = s.size ? sc.spec.data.map((r) => r[s.size!]).filter(isNumber) : [];
  const maxSize = sizes.length ? Math.max(...sizes) : 1;
  const group = sc.renderer.group({ class: 'vitecharts-points' }, parent);

  sc.spec.data.forEach((row, j) => {
    const v = row[s.y];
    if (!isNumber(v)) return;
    const cx = centerX(frame, row[sc.spec.x]);
    const cy = frame.y.map(v);
    let r = 5;
    if (s.size) {
      const raw = row[s.size];
      r = 4 + (isNumber(raw) ? Math.sqrt(raw / maxSize) * 14 : 0);
    }
    const dot = sc.renderer.circle(
      { cx, cy, r, fill: s.color, 'fill-opacity': 0.7, stroke: s.color, 'stroke-width': 1 },
      group,
    );
    record(sc, s, row[sc.spec.x], v, cx, cy);
    if (animation.enter) {
      const popDelay =
        sc.delay + (j / Math.max(1, sc.spec.data.length)) * animation.config.duration;
      animation.track(animateAttr(dot, 'r', 0, r, animation.config, { delay: popDelay }));
    }
  });
}

/** Bucket collected points by x position into sorted groups for hit-testing. */
function buildGroups(points: PlotPoint[]): XGroup[] {
  const byX = new Map<number, XGroup>();
  for (const p of points) {
    const key = Math.round(p.cx);
    let g = byX.get(key);
    if (!g) {
      g = { x: p.cx, xRaw: p.xRaw, points: [] };
      byX.set(key, g);
    }
    g.points.push(p);
  }
  return [...byX.values()].sort((a, b) => a.x - b.x);
}

function render(ctx: ChartContext): void {
  const { renderer, spec, animation } = ctx;
  const hasBar = spec.series.some((s) => s.type === 'bar' && !s.hidden);
  const frame = drawFrame(ctx, hasBar, spec.stacked);
  const plot = renderer.group({ class: 'vitecharts-series' });
  const stacks = spec.stacked ? stackSeries(ctx) : null;

  const collected: PlotPoint[] = [];
  const collect = (p: PlotPoint) => collected.push(p);

  const barSeries = spec.series.filter((s) => s.type === 'bar' && !s.hidden);
  let barIndex = 0;

  spec.series.forEach((s, i) => {
    if (s.hidden) return;
    const sc: SeriesCtx = {
      renderer,
      frame,
      spec,
      animation,
      delay: animation.config.delay + i * animation.config.stagger,
      seriesIndex: i,
      collect,
    };
    switch (s.type) {
      case 'bar':
        drawBarSeries(sc, s, plot, { index: barIndex, count: barSeries.length }, stacks);
        barIndex++;
        break;
      case 'area':
        drawAreaSeries(sc, s, plot, stacks);
        break;
      case 'scatter':
        drawScatterSeries(sc, s, plot);
        break;
      default:
        drawLineSeries(sc, s, plot);
    }
  });

  const model: InteractionModel = {
    bounds: { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom },
    groups: buildGroups(collected),
  };
  ctx.scene.setModel(model);
}

/** One renderer for every cartesian chart type; per-series `type` enables combos. */
export const cartesianChart: ChartType = { render };
