import { extent, max, min } from 'd3-array';
import { scaleLinear, scalePoint, scaleTime, type ScaleContinuousNumeric } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import type { ChartContext, ChartType, ResolvedOptions, Row } from '../types.js';

type XScale = (value: unknown) => number;

interface Pt {
  x: unknown;
  y: number;
}

const AXIS_COLOR = '#e0e0e0';
const LABEL_COLOR = '#6b7280';

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Build an x scale + tick list from the raw x values, inferring the data kind. */
function buildXScale(values: unknown[], left: number, right: number) {
  if (values.every(isNumber)) {
    const [lo, hi] = extent(values as number[]);
    const scale = scaleLinear()
      .domain([lo ?? 0, hi ?? 1])
      .range([left, right]);
    return { scale: ((v: unknown) => scale(v as number)) as XScale, ticks: scale.ticks(6) };
  }
  if (values.every((v) => v instanceof Date)) {
    const [lo, hi] = extent(values as Date[]);
    const scale = scaleTime()
      .domain([lo ?? new Date(0), hi ?? new Date()])
      .range([left, right]);
    return { scale: ((v: unknown) => scale(v as Date)) as XScale, ticks: scale.ticks(6) };
  }
  const domain = [...new Set(values.map(String))];
  const scale = scalePoint<string>().domain(domain).range([left, right]).padding(0.5);
  return {
    scale: ((v: unknown) => scale(String(v)) ?? left) as XScale,
    ticks: domain as unknown[],
  };
}

function seriesPoints(data: ReadonlyArray<Row>, xKey: string, yKey: string): Pt[] {
  const pts: Pt[] = [];
  for (const row of data) {
    const y = row[yKey];
    if (isNumber(y)) pts.push({ x: row[xKey], y });
  }
  return pts;
}

function render({ renderer, width, height, options }: ChartContext): void {
  const { padding, colors } = options;
  const left = padding.left;
  const right = width - padding.right;
  const top = padding.top;
  const bottom = height - padding.bottom;

  const xValues = options.data.map((r) => r[options.x]);
  const { scale: x, ticks: xTicks } = buildXScale(xValues, left, right);

  const allY = options.series.flatMap((s) =>
    seriesPoints(options.data, options.x, s.y).map((p) => p.y),
  );
  const yMax = max(allY) ?? 1;
  const yMin = Math.min(0, min(allY) ?? 0);
  const y: ScaleContinuousNumeric<number, number> = scaleLinear()
    .domain([yMin, yMax])
    .nice()
    .range([bottom, top]);

  // --- grid + y axis ---
  const grid = renderer.group({ class: 'vitecharts-grid' });
  for (const t of y.ticks(options.axes?.y?.ticks ?? 5)) {
    const py = y(t);
    renderer.line({ x1: left, x2: right, y1: py, y2: py, stroke: AXIS_COLOR }, grid);
    renderer.text(
      options.axes?.y?.format ? options.axes.y.format(t) : String(t),
      {
        x: left - 8,
        y: py + 4,
        'text-anchor': 'end',
        'font-size': 11,
        fill: LABEL_COLOR,
        'font-family': 'system-ui, sans-serif',
      },
      grid,
    );
  }

  // --- x axis labels ---
  const xaxis = renderer.group({ class: 'vitecharts-xaxis' });
  renderer.line({ x1: left, x2: right, y1: bottom, y2: bottom, stroke: AXIS_COLOR }, xaxis);
  for (const t of xTicks) {
    const px = x(t);
    renderer.text(
      options.axes?.x?.format ? options.axes.x.format(t) : String(t),
      {
        x: px,
        y: bottom + 18,
        'text-anchor': 'middle',
        'font-size': 11,
        fill: LABEL_COLOR,
        'font-family': 'system-ui, sans-serif',
      },
      xaxis,
    );
  }

  // --- series lines ---
  const plot = renderer.group({ class: 'vitecharts-series' });
  options.series.forEach((s, i) => {
    const pts = seriesPoints(options.data, options.x, s.y);
    const gen = d3line<Pt>()
      .x((p) => x(p.x))
      .y((p) => y(p.y));
    const d = gen(pts) ?? '';
    renderer.path(
      {
        d,
        fill: 'none',
        stroke: s.color ?? colors[i % colors.length] ?? '#000',
        'stroke-width': 2,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
      },
      plot,
    );
  });
}

export const lineChart: ChartType = { render };

/** Re-exported for tests / introspection. */
export function resolvedSeriesCount(o: ResolvedOptions): number {
  return o.series.length;
}
