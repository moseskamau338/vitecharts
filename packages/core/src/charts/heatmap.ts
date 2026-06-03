import { animateFadeIn } from '../anim/choreography.js';
import { isNumber } from '../util/guards.js';
import type { ChartContext, ChartType } from '../types.js';

function hex(c: string): [number, number, number] {
  const n = parseInt(c.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Interpolate from a light tint to the base color by `t` in [0, 1]. */
function colorFor(base: string, t: number): string {
  const [r, g, b] = hex(base);
  const lerp = (v: number) => Math.round(255 + (v - 255) * Math.max(0, Math.min(1, t)));
  return `rgb(${lerp(r)},${lerp(g)},${lerp(b)})`;
}

/**
 * Heatmap: columns come from the `x` values (one per data row), rows from the
 * series, and each cell's value is `row[series.y]`. A continuous visualMap
 * legend maps value → color.
 */
function render(ctx: ChartContext): void {
  const { renderer, width, height, spec, animation } = ctx;
  const { padding, theme } = spec;
  const left = padding.left;
  const right = width - padding.right;
  const top = padding.top;
  const bottom = height - padding.bottom - 28; // room for the legend
  const rows = spec.series.filter((s) => !s.hidden);
  const cols = spec.data;
  const base = theme.colors[0] ?? '#008FFB';

  const all = rows.flatMap((s) => cols.map((r) => r[s.y]).filter(isNumber));
  const min = Math.min(...all, 0);
  const max = Math.max(...all, 1);
  const span = max - min || 1;

  const cellW = (right - left) / Math.max(1, cols.length);
  const cellH = (bottom - top) / Math.max(1, rows.length);

  const group = renderer.group({ class: 'vitecharts-heatmap' });
  rows.forEach((s, ri) => {
    cols.forEach((row, ci) => {
      const v = row[s.y];
      if (!isNumber(v)) return;
      const cell = renderer.rect(
        {
          x: left + ci * cellW + 1,
          y: top + ri * cellH + 1,
          width: cellW - 2,
          height: cellH - 2,
          rx: 2,
          fill: colorFor(base, (v - min) / span),
        },
        group,
      );
      if (animation.enter) {
        animation.track(
          animateFadeIn(cell, animation.config, { delay: (ri * cols.length + ci) * 6 }),
        );
      }
    });
    // row label
    renderer.text(
      s.name,
      {
        x: left - 6,
        y: top + ri * cellH + cellH / 2 + 4,
        'text-anchor': 'end',
        'font-size': 11,
        'font-family': theme.fontFamily,
        fill: theme.labelColor,
      },
      group,
    );
  });

  // visualMap legend: a gradient bar with min/max labels
  const legendW = 180;
  const lx = (left + right) / 2 - legendW / 2;
  const ly = bottom + 16;
  if (renderer.gradient) {
    const grad = renderer.gradient(
      [
        { offset: 0, color: colorFor(base, 0) },
        { offset: 1, color: colorFor(base, 1) },
      ],
      false,
    );
    renderer.rect({ x: lx, y: ly, width: legendW, height: 10, rx: 5, fill: grad }, group);
  }
  const lbl = (x: number, text: string, anchor: string) =>
    renderer.text(
      text,
      { x, y: ly + 9, 'text-anchor': anchor, 'font-size': 10, fill: theme.labelColor },
      group,
    );
  lbl(lx - 6, String(Math.round(min)), 'end');
  lbl(lx + legendW + 6, String(Math.round(max)), 'start');
}

export const heatmapChart: ChartType = { render };
