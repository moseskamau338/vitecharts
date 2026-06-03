import {
  animateAttr,
  animateBarGrow,
  animateDrawOn,
  animateFadeIn,
  animateNumber,
  animateRectMorph,
  polylineLength,
} from '../anim/choreography.js';
import { drawArea, type AreaPoint } from '../marks/area.js';
import { drawBar } from '../marks/bar.js';
import { drawLine } from '../marks/line.js';
import type { PixelPoint } from '../marks/types.js';
import { buildScale, type PositionScale } from '../scales/index.js';
import { isNumber } from '../util/guards.js';
import { lttb } from '../util/downsample.js';
import type { ChartContext, ChartType, ResolvedSeries, Row } from '../types.js';
import type { NodeHandle, Renderer } from '../renderer/types.js';
import type { InteractionModel, PlotPoint, XGroup } from '../interaction/types.js';

const MARKER_RADIUS = 4;
const BAR_GAP = 0.85; // fraction of the available slot a bar fills
const LTTB_THRESHOLD = 2000; // downsample line series longer than this

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

const BAND_TYPES = new Set(['bar', 'candlestick', 'boxplot', 'rangeBar']);
const UP_COLOR = '#26a69a';
const DOWN_COLOR = '#ef5350';

/** Keys of a series that contribute to the value-axis domain. */
function domainKeys(s: ResolvedSeries): string[] {
  switch (s.type) {
    case 'candlestick':
      return [s.high, s.low, s.open, s.close].filter((k): k is string => !!k);
    case 'boxplot':
      return [s.high, s.low].filter((k): k is string => !!k);
    case 'rangeBar':
    case 'rangeArea':
      return [s.low, s.high].filter((k): k is string => !!k);
    default:
      return [s.y];
  }
}

/** Per-row y values used to size the value axis (flat, or stacked totals). */
function valueDomain(ctx: ChartContext, stacked: boolean): number[] {
  const { spec } = ctx;
  if (!stacked) {
    return spec.series.flatMap((s) =>
      domainKeys(s).flatMap((k) => spec.data.map((r) => r[k]).filter(isNumber)),
    );
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

  // Sparkline: chromeless — scales only, no grid or axes.
  if (spec.sparkline) return { x, y, left, right, top, bottom };

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

interface RawPoint extends PixelPoint {
  xRaw: unknown;
  value: number;
}

/** Paint reference for a series fill — a vertical gradient if requested. */
function seriesFill(sc: SeriesCtx, s: ResolvedSeries, bottomOpacity = 0): string {
  if (s.gradient && sc.renderer.gradient) {
    return sc.renderer.gradient([
      { offset: 0, color: s.color, opacity: s.fillOpacity },
      { offset: 1, color: s.color, opacity: bottomOpacity },
    ]);
  }
  return s.color;
}

/** Draw a value label above a datum when `dataLabels` is on; returns the node. */
function drawLabel(
  sc: SeriesCtx,
  value: number,
  cx: number,
  cy: number,
  parent: NodeHandle,
): NodeHandle | null {
  if (!sc.spec.dataLabels || !Number.isFinite(value)) return null;
  return sc.renderer.text(
    String(value),
    {
      x: cx,
      y: cy - 8,
      'text-anchor': 'middle',
      'font-size': 10,
      'font-family': sc.spec.theme.fontFamily,
      fill: sc.spec.theme.labelColor,
    },
    parent,
  );
}

function linePoints(sc: SeriesCtx, s: ResolvedSeries): RawPoint[] {
  const raw: RawPoint[] = [];
  for (const row of sc.spec.data) {
    const v = row[s.y];
    if (v === null) {
      // Explicit null → break the line (gap); missing keys are skipped instead.
      raw.push({ x: centerX(sc.frame, row[sc.spec.x]), y: NaN, xRaw: row[sc.spec.x], value: NaN });
      continue;
    }
    if (!isNumber(v)) continue;
    raw.push({
      x: centerX(sc.frame, row[sc.spec.x]),
      y: sc.frame.y.map(v),
      xRaw: row[sc.spec.x],
      value: v,
    });
  }
  // Downsample very dense series (preserves shape, keeps the path light).
  const hasGaps = raw.some((p) => !Number.isFinite(p.y));
  const pts = !hasGaps && raw.length > LTTB_THRESHOLD ? lttb(raw, LTTB_THRESHOLD) : raw;
  for (const p of pts) {
    if (Number.isFinite(p.y)) record(sc, s, p.xRaw, p.value, p.x, p.y);
  }
  return pts;
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
    if (!Number.isFinite(p.y)) return;
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
  const path = drawLine(
    sc.renderer,
    points,
    { stroke: s.color, width: 2, curve: s.curve, dash: s.dash },
    parent,
  );
  if (sc.animation.enter) {
    sc.animation.track(
      animateDrawOn(path, polylineLength(points), sc.animation.config, { delay: sc.delay }),
    );
  }
  if (sc.spec.markers) drawMarkers(sc, s, points, parent);
  if (sc.spec.dataLabels) {
    const labels = sc.renderer.group({ class: 'vitecharts-labels' }, parent);
    for (const p of points) drawLabel(sc, p.value, p.x, p.y, labels);
  }
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
    { fill: seriesFill(sc, s), opacity: s.gradient ? 1 : s.fillOpacity, curve: s.curve },
    parent,
  );
  const line = drawLine(
    sc.renderer,
    topPts,
    { stroke: s.color, width: 2, curve: s.curve, dash: s.dash },
    parent,
  );
  if (sc.animation.enter) {
    sc.animation.track(animateFadeIn(fill, sc.animation.config, { delay: sc.delay }));
    sc.animation.track(
      animateDrawOn(line, polylineLength(topPts), sc.animation.config, { delay: sc.delay }),
    );
  }
  if (sc.spec.dataLabels) {
    const labels = sc.renderer.group({ class: 'vitecharts-labels' }, parent);
    sc.spec.data.forEach((row, i) => {
      const v = row[s.y];
      if (isNumber(v)) {
        const sp = stack?.[i];
        drawLabel(sc, v, centerX(frame, row[sc.spec.x]), frame.y.map(sp ? sp.y1 : v), labels);
      }
    });
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
  const labelGroup = sc.spec.dataLabels
    ? sc.renderer.group({ class: 'vitecharts-labels' }, parent)
    : null;

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
      { fill: seriesFill(sc, s, 0.55), opacity: s.gradient ? 1 : s.fillOpacity, radius: 2 },
      parent,
    );

    const key = `bar:${sc.seriesIndex}:${String(row[sc.spec.x])}`;
    const prev = animation.prev?.get(key);
    animation.snapshot.set(key, [x, y, barWidth, h, v]);

    if (animation.enter) {
      animation.track(
        animateBarGrow(rect, y, h, baseline, animation.config, {
          delay:
            sc.delay + (i / Math.max(1, sc.spec.data.length)) * animation.config.duration * 0.5,
        }),
      );
    } else if (animation.dynamic && prev) {
      // FLIP: slide + resize from the previous bar geometry (bar-race).
      animation.track(animateRectMorph(rect, prev, [x, y, barWidth, h], animation.config));
    }

    if (labelGroup) {
      const node = drawLabel(sc, v, x + barWidth / 2, y, labelGroup);
      if (node && animation.dynamic && prev) {
        animation.track(animateNumber(node, prev[4] ?? v, v, animation.config));
      }
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
    if (sc.spec.dataLabels) drawLabel(sc, v, cx, cy - r, group);
  });
}

function num(row: Row, key: string | undefined): number | null {
  if (!key) return null;
  const v = row[key];
  return isNumber(v) ? v : null;
}

function drawCandlestickSeries(sc: SeriesCtx, s: ResolvedSeries, parent: NodeHandle): void {
  const { frame } = sc;
  const band = frame.x.bandwidth || 24;
  const bodyW = band * 0.6;
  for (const row of sc.spec.data) {
    const o = num(row, s.open);
    const h = num(row, s.high);
    const l = num(row, s.low);
    const c = num(row, s.close);
    if (o == null || h == null || l == null || c == null) continue;
    const cx = frame.x.map(row[sc.spec.x]) + band / 2;
    const up = c >= o;
    const color = up ? UP_COLOR : DOWN_COLOR;
    // wick (high–low)
    strokeLine(sc, cx, frame.y.map(h), cx, frame.y.map(l), color, parent);
    // body (open–close)
    const top = frame.y.map(Math.max(o, c));
    const h2 = Math.abs(frame.y.map(o) - frame.y.map(c)) || 1;
    drawBar(
      sc.renderer,
      { x: cx - bodyW / 2, y: top, width: bodyW, height: h2 },
      { fill: color },
      parent,
    );
    record(sc, s, row[sc.spec.x], c, cx, top);
  }
}

function strokeLine(
  sc: SeriesCtx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  parent: NodeHandle,
): void {
  sc.renderer.line({ x1, y1, x2, y2, stroke, 'stroke-width': 1.5 }, parent);
}

function drawBoxplotSeries(sc: SeriesCtx, s: ResolvedSeries, parent: NodeHandle): void {
  const { frame } = sc;
  const band = frame.x.bandwidth || 32;
  const boxW = band * 0.5;
  for (const row of sc.spec.data) {
    const lo = num(row, s.low);
    const q1 = num(row, s.q1);
    const med = num(row, s.median);
    const q3 = num(row, s.q3);
    const hi = num(row, s.high);
    if (lo == null || q1 == null || med == null || q3 == null || hi == null) continue;
    const cx = frame.x.map(row[sc.spec.x]) + band / 2;
    const yLo = frame.y.map(lo);
    const yHi = frame.y.map(hi);
    // whiskers + caps
    strokeLine(sc, cx, yHi, cx, frame.y.map(q3), s.color, parent);
    strokeLine(sc, cx, frame.y.map(q1), cx, yLo, s.color, parent);
    strokeLine(sc, cx - boxW / 4, yHi, cx + boxW / 4, yHi, s.color, parent);
    strokeLine(sc, cx - boxW / 4, yLo, cx + boxW / 4, yLo, s.color, parent);
    // box (q1–q3) + median line
    const top = frame.y.map(q3);
    drawBar(
      sc.renderer,
      { x: cx - boxW / 2, y: top, width: boxW, height: Math.abs(frame.y.map(q1) - top) || 1 },
      { fill: s.color, opacity: 0.25, radius: 1 },
      parent,
    );
    strokeLine(
      sc,
      cx - boxW / 2,
      frame.y.map(med),
      cx + boxW / 2,
      frame.y.map(med),
      s.color,
      parent,
    );
    record(sc, s, row[sc.spec.x], med, cx, top);
  }
}

function drawRangeBarSeries(sc: SeriesCtx, s: ResolvedSeries, parent: NodeHandle): void {
  const { frame } = sc;
  const band = frame.x.bandwidth || 32;
  const barW = band * BAR_GAP;
  for (const row of sc.spec.data) {
    const lo = num(row, s.low);
    const hi = num(row, s.high);
    if (lo == null || hi == null) continue;
    const cx = frame.x.map(row[sc.spec.x]) + band / 2;
    const yTop = frame.y.map(Math.max(lo, hi));
    const h = Math.abs(frame.y.map(hi) - frame.y.map(lo)) || 1;
    drawBar(
      sc.renderer,
      { x: cx - barW / 2, y: yTop, width: barW, height: h },
      { fill: seriesFill(sc, s, 0.55), opacity: s.gradient ? 1 : s.fillOpacity, radius: 3 },
      parent,
    );
    record(sc, s, row[sc.spec.x], hi, cx, yTop);
  }
}

function drawRangeAreaSeries(sc: SeriesCtx, s: ResolvedSeries, parent: NodeHandle): void {
  const { frame } = sc;
  const areaPts: AreaPoint[] = [];
  const hiPts: PixelPoint[] = [];
  const loPts: PixelPoint[] = [];
  for (const row of sc.spec.data) {
    const lo = num(row, s.low);
    const hi = num(row, s.high);
    if (lo == null || hi == null) continue;
    const cx = centerX(frame, row[sc.spec.x]);
    areaPts.push({ x: cx, y: frame.y.map(hi), y0: frame.y.map(lo) });
    hiPts.push({ x: cx, y: frame.y.map(hi) });
    loPts.push({ x: cx, y: frame.y.map(lo) });
    record(sc, s, row[sc.spec.x], hi, cx, frame.y.map(hi));
  }
  const fill = drawArea(
    sc.renderer,
    areaPts,
    { fill: s.color, opacity: s.fillOpacity, curve: s.curve },
    parent,
  );
  drawLine(sc.renderer, hiPts, { stroke: s.color, width: 2, curve: s.curve }, parent);
  drawLine(sc.renderer, loPts, { stroke: s.color, width: 2, curve: s.curve }, parent);
  if (sc.animation.enter)
    sc.animation.track(animateFadeIn(fill, sc.animation.config, { delay: sc.delay }));
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

function drawAnnotations(ctx: ChartContext, frame: Frame): void {
  const { renderer, spec } = ctx;
  if (spec.annotations.length === 0) return;
  const g = renderer.group({ class: 'vitecharts-annotations' });
  const labelAttrs = (x: number, y: number, anchor: string, color: string) => ({
    x,
    y,
    fill: color,
    'text-anchor': anchor,
    'font-size': 10,
    'font-family': spec.theme.fontFamily,
  });

  for (const a of spec.annotations) {
    const color = a.color ?? '#e53935';
    if (a.type === 'yLine' && a.y != null) {
      const py = frame.y.map(a.y);
      renderer.line(
        {
          x1: frame.left,
          x2: frame.right,
          y1: py,
          y2: py,
          stroke: color,
          'stroke-dasharray': '4 3',
        },
        g,
      );
      if (a.label) renderer.text(a.label, labelAttrs(frame.right - 4, py - 4, 'end', color), g);
    } else if (a.type === 'xLine' && a.x != null) {
      const px = frame.x.map(a.x) + frame.x.bandwidth / 2;
      renderer.line(
        {
          x1: px,
          x2: px,
          y1: frame.top,
          y2: frame.bottom,
          stroke: color,
          'stroke-dasharray': '4 3',
        },
        g,
      );
      if (a.label) renderer.text(a.label, labelAttrs(px + 4, frame.top + 10, 'start', color), g);
    } else if (a.type === 'region') {
      const x1 = a.x != null ? frame.x.map(a.x) : frame.left;
      const x2 = a.x2 != null ? frame.x.map(a.x2) + frame.x.bandwidth : frame.right;
      const y1 = a.y != null ? frame.y.map(a.y) : frame.top;
      const y2 = a.y2 != null ? frame.y.map(a.y2) : frame.bottom;
      renderer.rect(
        {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
          fill: color,
          'fill-opacity': 0.1,
        },
        g,
      );
    } else if (a.type === 'point' && a.x != null && a.y != null) {
      const px = frame.x.map(a.x) + frame.x.bandwidth / 2;
      const py = frame.y.map(a.y);
      renderer.circle(
        { cx: px, cy: py, r: 4, fill: color, stroke: '#fff', 'stroke-width': 1.5 },
        g,
      );
      if (a.label) renderer.text(a.label, labelAttrs(px, py - 8, 'middle', color), g);
    }
  }
}

function render(ctx: ChartContext): void {
  const { renderer, spec, animation } = ctx;
  const bandX = spec.series.some((s) => BAND_TYPES.has(s.type) && !s.hidden);
  const frame = drawFrame(ctx, bandX, spec.stacked);
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
      case 'rangeBar':
        drawRangeBarSeries(sc, s, plot);
        break;
      case 'area':
        drawAreaSeries(sc, s, plot, stacks);
        break;
      case 'rangeArea':
        drawRangeAreaSeries(sc, s, plot);
        break;
      case 'scatter':
        drawScatterSeries(sc, s, plot);
        break;
      case 'candlestick':
        drawCandlestickSeries(sc, s, plot);
        break;
      case 'boxplot':
        drawBoxplotSeries(sc, s, plot);
        break;
      default:
        drawLineSeries(sc, s, plot);
    }
  });

  drawAnnotations(ctx, frame);

  const model: InteractionModel = {
    bounds: { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom },
    groups: buildGroups(collected),
  };
  ctx.scene.setModel(model);
}

/** One renderer for every cartesian chart type; per-series `type` enables combos. */
export const cartesianChart: ChartType = { render };
