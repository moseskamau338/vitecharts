import { drawLine } from '../marks/line.js';
import type { PixelPoint } from '../marks/types.js';
import { buildScale } from '../scales/index.js';
import { isNumber } from '../util/guards.js';
import type { ChartContext, ChartType } from '../types.js';

function render({ renderer, width, height, spec }: ChartContext): void {
  const { padding, theme } = spec;
  const left = padding.left;
  const right = width - padding.right;
  const top = padding.top;
  const bottom = height - padding.bottom;

  const xValues = spec.data.map((r) => r[spec.x]);
  const x = buildScale(xValues, [left, right], {
    type: spec.xAxis.type,
    min: spec.xAxis.min,
    max: spec.xAxis.max,
  });

  const yValues = spec.series.flatMap((s) => spec.data.map((r) => r[s.y]).filter(isNumber));
  const y = buildScale(yValues, [bottom, top], {
    type: spec.yAxis.type ?? 'linear',
    zero: true,
    min: spec.yAxis.min,
    max: spec.yAxis.max,
  });

  const labelStyle = (anchor: string) => ({
    'text-anchor': anchor,
    'font-size': 11,
    fill: theme.labelColor,
    'font-family': theme.fontFamily,
  });

  // grid + y-axis labels
  const grid = renderer.group({ class: 'vitecharts-grid' });
  for (const tick of y.ticks(spec.yAxis.ticks)) {
    const py = y.map(tick);
    renderer.line({ x1: left, x2: right, y1: py, y2: py, stroke: theme.gridColor }, grid);
    const label = spec.yAxis.format ? spec.yAxis.format(tick) : y.format(tick);
    renderer.text(label, { x: left - 8, y: py + 4, ...labelStyle('end') }, grid);
  }

  // x-axis baseline + labels
  const xaxis = renderer.group({ class: 'vitecharts-xaxis' });
  renderer.line({ x1: left, x2: right, y1: bottom, y2: bottom, stroke: theme.axisColor }, xaxis);
  for (const tick of x.ticks(spec.xAxis.ticks)) {
    const px = x.map(tick);
    const label = spec.xAxis.format ? spec.xAxis.format(tick) : x.format(tick);
    renderer.text(label, { x: px, y: bottom + 18, ...labelStyle('middle') }, xaxis);
  }

  // series
  const plot = renderer.group({ class: 'vitecharts-series' });
  for (const s of spec.series) {
    const points: PixelPoint[] = [];
    for (const row of spec.data) {
      const value = row[s.y];
      if (isNumber(value)) points.push({ x: x.map(row[spec.x]), y: y.map(value) });
    }
    drawLine(renderer, points, { stroke: s.color, width: 2, curve: s.curve }, plot);
  }
}

export const lineChart: ChartType = { render };
