import { animateArcSweep, animateFadeIn } from '../anim/choreography.js';
import { arcPath } from '../marks/arc.js';
import { buildScale } from '../scales/index.js';
import { isNumber } from '../util/guards.js';
import type { ChartContext, ChartType, CompiledSpec } from '../types.js';
import type { NodeHandle, Renderer } from '../renderer/types.js';
import type { ChartPlugin } from './registry.js';

const TAU = Math.PI * 2;
const GAUGE_SWEEP = 1.5 * Math.PI; // 270° gauge arc

interface Geometry {
  cx: number;
  cy: number;
  radius: number;
}

function geometry(ctx: ChartContext): Geometry {
  const { width, height, spec } = ctx;
  const { padding } = spec;
  const left = padding.left;
  const right = width - padding.right;
  const top = padding.top;
  const bottom = height - padding.bottom;
  return {
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
    radius: (Math.min(right - left, bottom - top) / 2) * 0.92,
  };
}

function centered(renderer: Renderer, g: Geometry): NodeHandle {
  return renderer.group({ class: 'vitecharts-radial', transform: `translate(${g.cx},${g.cy})` });
}

function sliceColor(spec: CompiledSpec, i: number): string {
  return spec.theme.colors[i % spec.theme.colors.length] ?? '#888';
}

/** Slice values come from the first series; each row is a slice labeled by x. */
function sliceValues(spec: CompiledSpec): { label: unknown; value: number }[] {
  const key = spec.series[0]?.y;
  if (!key) return [];
  return spec.data
    .map((row) => ({ label: row[spec.x], value: row[key] }))
    .filter((d): d is { label: unknown; value: number } => isNumber(d.value));
}

function renderPie(ctx: ChartContext): void {
  const { renderer, spec, animation } = ctx;
  const g = geometry(ctx);
  const group = centered(renderer, g);
  const slices = sliceValues(spec);
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const inner = spec.innerRadius * g.radius;

  let angle = 0;
  slices.forEach((slice, i) => {
    const start = angle;
    const end = angle + (slice.value / total) * TAU;
    angle = end;
    const arc = { innerRadius: inner, outerRadius: g.radius, startAngle: start, endAngle: end };
    const node = renderer.path(
      { d: arcPath(arc), fill: sliceColor(spec, i), stroke: '#fff', 'stroke-width': 1 },
      group,
    );
    if (animation.enter) {
      animation.track(
        animateArcSweep(node, arc, animation.config, { delay: animation.config.delay + i * 60 }),
      );
    }
  });

  if (inner > 0) {
    renderer.text(
      String(total),
      {
        x: 0,
        y: 6,
        'text-anchor': 'middle',
        'font-size': 16,
        'font-weight': 600,
        'font-family': spec.theme.fontFamily,
        fill: spec.theme.labelColor,
      },
      group,
    );
  }
}

function renderPolarArea(ctx: ChartContext): void {
  const { renderer, spec, animation } = ctx;
  const g = geometry(ctx);
  const group = centered(renderer, g);
  const slices = sliceValues(spec);
  const max = Math.max(1, ...slices.map((s) => s.value));
  const step = TAU / Math.max(1, slices.length);

  slices.forEach((slice, i) => {
    const outer = Math.sqrt(slice.value / max) * g.radius;
    const arc = {
      innerRadius: 0,
      outerRadius: outer,
      startAngle: i * step,
      endAngle: (i + 1) * step,
    };
    const node = renderer.path(
      {
        d: arcPath(arc),
        fill: sliceColor(spec, i),
        'fill-opacity': 0.75,
        stroke: '#fff',
        'stroke-width': 1,
      },
      group,
    );
    if (animation.enter) {
      animation.track(animateFadeIn(node, animation.config, { delay: i * 50 }));
    }
  });
}

function renderRadialBar(ctx: ChartContext): void {
  const { renderer, spec, animation } = ctx;
  const g = geometry(ctx);
  const group = centered(renderer, g);
  const rows = sliceValues(spec);
  const max = Math.max(1, ...rows.map((r) => r.value));
  const ringWidth = (g.radius * 0.7) / Math.max(1, rows.length);
  const start = -Math.PI / 2;

  rows.forEach((row, i) => {
    const outer = g.radius - i * ringWidth;
    const inner = outer - ringWidth * 0.75;
    const track = {
      innerRadius: inner,
      outerRadius: outer,
      startAngle: start,
      endAngle: start + GAUGE_SWEEP,
    };
    renderer.path({ d: arcPath(track), fill: spec.theme.gridColor }, group);
    const frac = row.value / max;
    const arc = {
      innerRadius: inner,
      outerRadius: outer,
      startAngle: start,
      endAngle: start + GAUGE_SWEEP * frac,
    };
    const node = renderer.path({ d: arcPath(arc), fill: sliceColor(spec, i) }, group);
    if (animation.enter) {
      animation.track(animateArcSweep(node, arc, animation.config, { delay: i * 80 }));
    }
  });
}

function renderRadar(ctx: ChartContext): void {
  const { renderer, spec, animation } = ctx;
  const g = geometry(ctx);
  const group = centered(renderer, g);
  const axes = spec.data.map((row) => row[spec.x]);
  const n = Math.max(1, axes.length);
  const step = TAU / n;
  const allValues = spec.series.flatMap((s) => spec.data.map((r) => r[s.y]).filter(isNumber));
  const r = buildScale(allValues, [0, g.radius], { type: 'linear', zero: true });

  // grid rings + spokes
  for (let ring = 1; ring <= 4; ring++) {
    const rr = (g.radius * ring) / 4;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + i * step;
      return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
    });
    renderer.path({ d: `M${pts.join('L')}Z`, fill: 'none', stroke: spec.theme.gridColor }, group);
  }
  axes.forEach((_, i) => {
    const a = -Math.PI / 2 + i * step;
    renderer.line(
      {
        x1: 0,
        y1: 0,
        x2: Math.cos(a) * g.radius,
        y2: Math.sin(a) * g.radius,
        stroke: spec.theme.gridColor,
      },
      group,
    );
  });

  spec.series.forEach((s, si) => {
    if (s.hidden) return;
    const pts = spec.data.map((row, i) => {
      const v = row[s.y];
      const radius = isNumber(v) ? r.map(v) : 0;
      const a = -Math.PI / 2 + i * step;
      return `${Math.cos(a) * radius},${Math.sin(a) * radius}`;
    });
    const poly = renderer.path(
      {
        d: `M${pts.join('L')}Z`,
        fill: s.color,
        'fill-opacity': 0.2,
        stroke: s.color,
        'stroke-width': 2,
      },
      group,
    );
    if (animation.enter) animation.track(animateFadeIn(poly, animation.config, { delay: si * 80 }));
  });
}

export const pieChart: ChartType = { render: renderPie };
export const polarAreaChart: ChartType = { render: renderPolarArea };
export const radialBarChart: ChartType = { render: renderRadialBar };
export const radarChart: ChartType = { render: renderRadar };

/** Registrable plugin: pie, donut, polarArea, radialBar, radar. */
export const radial: ChartPlugin = {
  types: {
    pie: pieChart,
    donut: pieChart,
    polarArea: polarAreaChart,
    radialBar: radialBarChart,
    radar: radarChart,
  },
};
