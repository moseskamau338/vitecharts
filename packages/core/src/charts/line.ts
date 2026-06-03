import { animateAttr, animateDrawOn, polylineLength } from '../anim/choreography.js';
import { drawLine } from '../marks/line.js';
import type { PixelPoint } from '../marks/types.js';
import { buildScale } from '../scales/index.js';
import { isNumber } from '../util/guards.js';
import type { ChartContext, ChartType } from '../types.js';

const MARKER_RADIUS = 4;

function render({ renderer, width, height, spec, animation }: ChartContext): void {
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

  // series — draw final geometry, then play enter choreography on first render
  const plot = renderer.group({ class: 'vitecharts-series' });
  const { config, enter } = animation;
  spec.series.forEach((s, i) => {
    const points: PixelPoint[] = [];
    for (const row of spec.data) {
      const value = row[s.y];
      if (isNumber(value)) points.push({ x: x.map(row[spec.x]), y: y.map(value) });
    }

    const path = drawLine(renderer, points, { stroke: s.color, width: 2, curve: s.curve }, plot);
    const delay = config.delay + i * config.stagger;
    if (enter) {
      animation.track(animateDrawOn(path, polylineLength(points), config, { delay }));
    }

    if (spec.markers) {
      const markers = renderer.group({ class: 'vitecharts-markers' }, plot);
      points.forEach((p, j) => {
        const dot = renderer.circle(
          {
            cx: p.x,
            cy: p.y,
            r: MARKER_RADIUS,
            fill: s.color,
            stroke: '#ffffff',
            'stroke-width': 1.5,
          },
          markers,
        );
        if (enter) {
          // Pop each marker in just behind the advancing line.
          const popDelay = delay + (j / Math.max(1, points.length)) * config.duration;
          animation.track(animateAttr(dot, 'r', 0, MARKER_RADIUS, config, { delay: popDelay }));
        }
      });
    }
  });
}

export const lineChart: ChartType = { render };
