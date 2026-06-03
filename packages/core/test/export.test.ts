import { describe, expect, it } from 'vitest';
import { Chart, toCSV, toJSON } from '../src/index.js';
import type { ChartOptions } from '../src/types.js';

const data = [
  { m: 'Jan', a: 10, b: 4 },
  { m: 'Feb', a: 20, b: 8 },
];

const opts: ChartOptions = {
  type: 'line',
  data,
  x: 'm',
  series: [{ y: 'a' }, { y: 'b' }],
  width: 600,
  animate: false,
};

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

describe('export utilities', () => {
  it('toCSV produces a header and one row per datum', () => {
    const csv = toCSV(data, 'm', ['a', 'b']);
    expect(csv.split('\n')).toEqual(['m,a,b', 'Jan,10,4', 'Feb,20,8']);
  });

  it('toCSV quotes cells containing commas', () => {
    const csv = toCSV([{ k: 'a,b', v: 1 }], 'k', ['v']);
    expect(csv).toContain('"a,b"');
  });

  it('toJSON includes type, x, series, and data', () => {
    const parsed = JSON.parse(toJSON(opts));
    expect(parsed.type).toBe('line');
    expect(parsed.data).toHaveLength(2);
  });
});

describe('Chart export methods', () => {
  it('toSVG returns standalone SVG markup', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    const svg = chart.toSVG();
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('toCSV reflects the current data after append', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    chart.appendData({ m: 'Mar', a: 30, b: 12 });
    expect(chart.toCSV().split('\n')).toHaveLength(4); // header + 3 rows
  });
});

describe('annotations', () => {
  it('draws a yLine annotation over the plot', () => {
    const el = mount();
    new Chart(el, { ...opts, annotations: [{ type: 'yLine', y: 15, label: 'target' }] });
    expect(el.querySelector('.vitecharts-annotations line')).not.toBeNull();
    expect(el.querySelector('.vitecharts-annotations text')?.textContent).toBe('target');
  });

  it('draws a region annotation as a rect', () => {
    const el = mount();
    new Chart(el, { ...opts, annotations: [{ type: 'region', y: 5, y2: 15 }] });
    expect(el.querySelector('.vitecharts-annotations rect')).not.toBeNull();
  });
});
