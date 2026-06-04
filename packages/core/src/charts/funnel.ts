import { animateFadeIn } from '../anim/choreography.js';
import { isNumber } from '../util/guards.js';
import type { ChartContext, ChartType, CompiledSpec } from '../types.js';
import type { ChartPlugin } from './registry.js';

/** Each row is a funnel stage: label from `x`, value from the first series. */
function stages(spec: CompiledSpec): { label: unknown; value: number }[] {
  const key = spec.series[0]?.y;
  if (!key) return [];
  return spec.data
    .map((row) => ({ label: row[spec.x], value: row[key] }))
    .filter((d): d is { label: unknown; value: number } => isNumber(d.value));
}

function render(ctx: ChartContext): void {
  const { renderer, width, height, spec, animation } = ctx;
  const { padding, theme } = spec;
  const left = padding.left;
  const right = width - padding.right;
  const top = padding.top;
  const bottom = height - padding.bottom;
  const data = stages(spec);
  const max = Math.max(1, ...data.map((d) => d.value));
  const cx = (left + right) / 2;
  const fullW = right - left;
  const rowH = (bottom - top) / Math.max(1, data.length);

  const group = renderer.group({ class: 'vitecharts-funnel' });
  data.forEach((d, i) => {
    const wTop = (d.value / max) * fullW;
    const next = data[i + 1];
    const wBot = ((next ? next.value : d.value) / max) * fullW;
    const y0 = top + i * rowH;
    const y1 = y0 + rowH * 0.9;
    const color = theme.colors[i % theme.colors.length] ?? '#888';
    const path = `M${cx - wTop / 2},${y0} L${cx + wTop / 2},${y0} L${cx + wBot / 2},${y1} L${cx - wBot / 2},${y1} Z`;
    const node = renderer.path({ d: path, fill: color, 'fill-opacity': 0.9 }, group);
    if (animation.enter) animation.track(animateFadeIn(node, animation.config, { delay: i * 60 }));
    renderer.text(
      `${d.label}: ${d.value}`,
      {
        x: cx,
        y: y0 + rowH * 0.45 + 4,
        'text-anchor': 'middle',
        'font-size': 12,
        'font-family': theme.fontFamily,
        fill: '#ffffff',
      },
      group,
    );
  });
}

export const funnelChart: ChartType = { render };

/** Registrable plugin: funnel. */
export const funnel: ChartPlugin = { types: { funnel: funnelChart } };
