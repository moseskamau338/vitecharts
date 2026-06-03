import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';
import type { ChartOptions } from '../src/types.js';

function mount(width = 600): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
  document.body.appendChild(el);
  return el;
}

const opts: ChartOptions = {
  type: 'line',
  data: [
    { t: 0, v: 1 },
    { t: 1, v: 2 },
  ],
  x: 't',
  series: [{ y: 'v' }],
  width: 600,
};

describe('Chart imperative API', () => {
  it('appendData grows the series and redraws', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    const before = el.querySelector('.vitecharts-series path')?.getAttribute('d') ?? '';
    chart.appendData({ t: 2, v: 5 });
    const after = el.querySelector('.vitecharts-series path')?.getAttribute('d') ?? '';
    expect(after).not.toBe(before);
  });

  it('updateSeries changes the number of drawn paths', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    chart.updateSeries([{ y: 'v' }, { y: 't' }]);
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(2);
  });

  it('destroy stops further rendering and unmounts the svg', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    chart.destroy();
    expect(el.querySelector('svg')).toBeNull();
    // updating after destroy must not throw or re-create the surface
    chart.appendData({ t: 9, v: 9 });
    expect(el.querySelector('svg')).toBeNull();
  });

  it('methods chain', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    expect(chart.setData([{ t: 0, v: 0 }]).appendData({ t: 1, v: 1 })).toBe(chart);
  });
});
