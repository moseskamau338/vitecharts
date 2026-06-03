import type { ChartOptions, ChartTypeName, CurveType, Row, SeriesOption } from '@vitecharts/core';

/**
 * Minimal shape of an ApexCharts options object — only the keys this shim reads.
 * It intentionally accepts `unknown`-ish data so real Apex configs type-check.
 */
export interface ApexOptions {
  chart?: { type?: string };
  series?: ApexSeries;
  labels?: string[];
  xaxis?: { categories?: unknown[] };
  colors?: string[];
  theme?: { mode?: 'light' | 'dark' };
  stroke?: { curve?: 'smooth' | 'straight' | 'stepline' };
  title?: { text?: string };
  legend?: { show?: boolean; position?: 'top' | 'bottom' | 'left' | 'right' };
}

type ApexPoint = number | [unknown, number] | { x?: unknown; y?: number };
type ApexCartesianSeries = { name?: string; data: ApexPoint[] }[];
type ApexSeries = number[] | ApexCartesianSeries;

const TYPE_MAP: Record<string, ChartTypeName> = {
  line: 'line',
  area: 'area',
  bar: 'bar',
  column: 'bar',
  scatter: 'scatter',
  bubble: 'scatter',
  pie: 'pie',
  donut: 'donut',
  radialBar: 'radialBar',
  radar: 'radar',
  polarArea: 'polarArea',
};

const RADIAL = new Set<ChartTypeName>(['pie', 'donut', 'polarArea', 'radialBar']);

function curve(apex: ApexOptions): CurveType | undefined {
  if (apex.stroke?.curve === 'smooth') return 'smooth';
  if (apex.stroke?.curve === 'stepline') return 'step';
  return undefined;
}

function pointValue(p: ApexPoint): number {
  if (typeof p === 'number') return p;
  if (Array.isArray(p)) return p[1];
  return p.y ?? 0;
}

function pointX(p: ApexPoint, fallback: unknown): unknown {
  if (Array.isArray(p)) return p[0];
  if (p && typeof p === 'object' && 'x' in p) return p.x;
  return fallback;
}

/**
 * Translate an ApexCharts options object into ViteCharts {@link ChartOptions}.
 *
 * Best-effort and intentionally partial — covered today: chart type, cartesian
 * series (numeric, `[x,y]`, and `{x,y}` data) with `xaxis.categories`, radial
 * series (`labels` + number[]), colors, dark theme, smooth/step curve, title
 * (→ aria-label), and legend visibility/position. Unsupported keys are ignored.
 */
export function fromApex(apex: ApexOptions): ChartOptions {
  const type = TYPE_MAP[apex.chart?.type ?? 'line'] ?? 'line';
  const base: Partial<ChartOptions> = {
    colors: apex.colors,
    theme: apex.theme?.mode === 'dark' ? 'dark' : undefined,
    ariaLabel: apex.title?.text,
    legend:
      apex.legend?.show === false
        ? false
        : apex.legend?.position
          ? { position: apex.legend.position }
          : undefined,
  };

  if (RADIAL.has(type)) {
    const values = (apex.series as number[]) ?? [];
    const labels = apex.labels ?? values.map((_, i) => `Slice ${i + 1}`);
    const data: Row[] = values.map((v, i) => ({ label: labels[i] ?? i, value: v }));
    return clean({ ...base, type, x: 'label', series: [{ y: 'value' }], data });
  }

  const apexSeries = (apex.series as ApexCartesianSeries) ?? [];
  const categories = apex.xaxis?.categories ?? [];
  const length = Math.max(categories.length, ...apexSeries.map((s) => s.data.length), 0);

  const data: Row[] = [];
  for (let i = 0; i < length; i++) {
    const row: Row = { x: categories[i] ?? i };
    apexSeries.forEach((s, j) => {
      const point = s.data[i];
      if (point === undefined) return;
      row[`y${j}`] = pointValue(point);
      if (categories.length === 0) row.x = pointX(point, i);
    });
    data.push(row);
  }

  const c = curve(apex);
  const series: SeriesOption[] = apexSeries.map((s, j) => ({
    y: `y${j}`,
    name: s.name,
    ...(c ? { curve: c } : {}),
  }));

  return clean({ ...base, type, x: 'x', series, data });
}

/** Drop undefined keys so the result is a clean ChartOptions object. */
function clean(options: Partial<ChartOptions>): ChartOptions {
  const out = { ...options };
  for (const key of Object.keys(out) as (keyof ChartOptions)[]) {
    if (out[key] === undefined) delete out[key];
  }
  return out as ChartOptions;
}
