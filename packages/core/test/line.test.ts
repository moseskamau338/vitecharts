import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';

const data = [
  { month: 'Jan', sales: 30, profit: 12 },
  { month: 'Feb', sales: 40, profit: 18 },
  { month: 'Mar', sales: 35, profit: 15 },
  { month: 'Apr', sales: 55, profit: 28 },
];

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

describe('Chart (line)', () => {
  it('mounts an svg surface', () => {
    const el = mount();
    new Chart(el, { type: 'line', data, x: 'month', series: [{ y: 'sales' }] });
    expect(el.querySelector('svg.vitecharts-svg')).not.toBeNull();
  });

  it('draws one path per series', () => {
    const el = mount();
    new Chart(el, {
      type: 'line',
      data,
      x: 'month',
      series: [{ y: 'sales' }, { y: 'profit' }],
      width: 600,
      height: 300,
    });
    const paths = el.querySelectorAll('.vitecharts-series path');
    expect(paths.length).toBe(2);
    expect(paths[0]?.getAttribute('d')).toMatch(/^M/);
  });

  it('re-renders on update without leaking nodes', () => {
    const el = mount();
    const chart = new Chart(el, {
      type: 'line',
      data,
      x: 'month',
      series: [{ y: 'sales' }],
      width: 600,
    });
    chart.update({ series: [{ y: 'sales' }, { y: 'profit' }] });
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(2);
    expect(el.querySelectorAll('svg').length).toBe(1);
  });

  it('throws on a missing target', () => {
    expect(() => new Chart('#nope', { type: 'line', data, x: 'month', series: [] })).toThrow();
  });
});
