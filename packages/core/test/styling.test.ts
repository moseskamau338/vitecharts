import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';
import type { ChartOptions } from '../src/types.js';

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

const data = [
  { m: 'Jan', v: 30 },
  { m: 'Feb', v: 40 },
  { m: 'Mar', v: 35 },
];

function make(extra: Partial<ChartOptions>): HTMLElement {
  const el = mount();
  new Chart(el, {
    type: 'line',
    data,
    x: 'm',
    series: [{ y: 'v' }],
    width: 600,
    animate: false,
    ...extra,
  });
  return el;
}

describe('styling pack', () => {
  it('gradient area fill references a <linearGradient> via url()', () => {
    const el = mount();
    new Chart(el, {
      type: 'area',
      data,
      x: 'm',
      series: [{ y: 'v', gradient: true }],
      width: 600,
      animate: false,
    });
    expect(el.querySelector('defs linearGradient')).not.toBeNull();
    const fill = el.querySelector('.vitecharts-series path')?.getAttribute('fill') ?? '';
    expect(fill).toMatch(/^url\(#vc-grad-/);
  });

  it('dashed line sets stroke-dasharray', () => {
    const el = make({ series: [{ y: 'v', dash: '6 4' }] });
    expect(el.querySelector('.vitecharts-series path')?.getAttribute('stroke-dasharray')).toBe(
      '6 4',
    );
  });

  it('dataLabels draws a value label per point', () => {
    const el = make({ dataLabels: true });
    const labels = el.querySelectorAll('.vitecharts-labels text');
    expect(labels.length).toBe(3);
    expect(labels[0]?.textContent).toBe('30');
  });

  it('sparkline mode draws no grid, axis, or tooltip', () => {
    const el = make({ sparkline: true });
    expect(el.querySelector('.vitecharts-grid')).toBeNull();
    expect(el.querySelector('.vitecharts-xaxis')).toBeNull();
    expect(el.querySelector('.vitecharts-tooltip')).toBeNull();
    expect(el.querySelector('.vitecharts-series path')).not.toBeNull();
  });

  it('null values break the line into multiple subpaths (gap)', () => {
    const el = mount();
    new Chart(el, {
      type: 'line',
      data: [
        { m: 'A', v: 1 },
        { m: 'B', v: null },
        { m: 'C', v: 3 },
      ],
      x: 'm',
      series: [{ y: 'v' }],
      width: 600,
      animate: false,
    });
    const d = el.querySelector('.vitecharts-series path')?.getAttribute('d') ?? '';
    // a gap produces a second "move" command
    expect((d.match(/M/g) ?? []).length).toBeGreaterThan(1);
  });
});
