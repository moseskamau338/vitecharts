import { describe, expect, it } from 'vitest';
import { Chart, lttb } from '../src/index.js';
import type { ChartOptions } from '../src/types.js';

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

describe('lttb downsampling', () => {
  it('reduces to the threshold and keeps the endpoints', () => {
    const data = Array.from({ length: 10000 }, (_, i) => ({ x: i, y: Math.sin(i / 50) }));
    const out = lttb(data, 500);
    expect(out).toHaveLength(500);
    expect(out[0]).toEqual(data[0]);
    expect(out[out.length - 1]).toEqual(data[data.length - 1]);
  });

  it('returns the input unchanged below the threshold', () => {
    const data = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(lttb(data, 500)).toBe(data);
  });
});

describe('accessibility', () => {
  it('sets role, aria-label, and a <title> on the svg', () => {
    const el = mount();
    const opts: ChartOptions = {
      type: 'bar',
      data: [{ m: 'A', v: 1 }],
      x: 'm',
      series: [{ y: 'v' }],
      width: 600,
      animate: false,
      ariaLabel: 'Monthly sales',
    };
    new Chart(el, opts);
    const svg = el.querySelector('svg') as SVGSVGElement;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Monthly sales');
    expect(svg.querySelector('title')?.textContent).toBe('Monthly sales');
  });

  it('falls back to an auto-generated label', () => {
    const el = mount();
    new Chart(el, {
      type: 'line',
      data: [{ m: 'A', v: 1 }],
      x: 'm',
      series: [{ y: 'v' }],
      width: 600,
      animate: false,
    });
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toMatch(/line chart with 1 series/);
  });
});
