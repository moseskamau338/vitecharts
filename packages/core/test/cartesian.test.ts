import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';
import type { ChartOptions, ChartTypeName } from '../src/types.js';

const data = [
  { q: 'Q1', a: 30, b: 12, size: 5 },
  { q: 'Q2', a: 40, b: 18, size: 9 },
  { q: 'Q3', a: 35, b: 15, size: 3 },
  { q: 'Q4', a: 55, b: 28, size: 7 },
];

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

function make(type: ChartTypeName, extra: Partial<ChartOptions> = {}): HTMLElement {
  const el = mount();
  new Chart(el, {
    type,
    data,
    x: 'q',
    series: [{ y: 'a' }, { y: 'b' }],
    width: 600,
    animate: false,
    ...extra,
  });
  return el;
}

describe('cartesian chart types', () => {
  it('bar: renders one rect per datum per series (grouped)', () => {
    const el = make('bar');
    expect(el.querySelectorAll('.vitecharts-series rect').length).toBe(data.length * 2);
  });

  it('bar stacked: still one rect per datum per series', () => {
    const el = make('bar', { stack: true });
    expect(el.querySelectorAll('.vitecharts-series rect').length).toBe(data.length * 2);
  });

  it('area: renders a filled path plus a top line per series', () => {
    const el = make('area');
    // 2 series x (1 area fill + 1 top line) = 4 paths
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(4);
  });

  it('scatter: renders one circle per datum per series', () => {
    const el = make('scatter');
    expect(el.querySelectorAll('.vitecharts-series circle').length).toBe(data.length * 2);
  });

  it('combo: per-series type mixes bars and a line', () => {
    const el = mount();
    new Chart(el, {
      type: 'bar',
      data,
      x: 'q',
      series: [
        { y: 'a', type: 'bar' },
        { y: 'b', type: 'line' },
      ],
      width: 600,
      animate: false,
    });
    expect(el.querySelectorAll('.vitecharts-series rect').length).toBe(data.length); // one bar series
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(1); // one line series
  });

  it('bubble: scatter with a size key varies the radius', () => {
    const el = mount();
    new Chart(el, {
      type: 'scatter',
      data,
      x: 'q',
      series: [{ y: 'a', size: 'size' }],
      width: 600,
      animate: false,
    });
    const radii = [...el.querySelectorAll('.vitecharts-points circle')].map((c) =>
      Number(c.getAttribute('r')),
    );
    expect(new Set(radii).size).toBeGreaterThan(1);
  });
});
