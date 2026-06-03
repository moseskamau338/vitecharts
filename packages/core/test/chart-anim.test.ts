import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';
import { scheduler } from '../src/anim/scheduler.js';
import type { ChartOptions } from '../src/types.js';

beforeAll(() => scheduler.setAuto(false));
afterAll(() => scheduler.setAuto(true));

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

const opts: ChartOptions = {
  type: 'line',
  data: [
    { t: 0, v: 1 },
    { t: 1, v: 3 },
    { t: 2, v: 2 },
  ],
  x: 't',
  series: [{ y: 'v' }],
  width: 600,
};

function seriesPath(el: HTMLElement): SVGPathElement {
  return el.querySelector('.vitecharts-series path') as SVGPathElement;
}

describe('Chart animation', () => {
  it('plays line draw-on on first render and resolves to a fully drawn stroke', () => {
    const el = mount();
    new Chart(el, { ...opts, animate: 'apex' });
    const p = seriesPath(el);
    expect(Number(p.getAttribute('stroke-dashoffset'))).toBeGreaterThan(0);
    scheduler.flush(0);
    scheduler.flush(3000);
    expect(p.getAttribute('stroke-dashoffset')).toBe('0');
    expect(p.getAttribute('stroke-dasharray')).toBe('none');
  });

  it('does not animate when animate:false', () => {
    const el = mount();
    new Chart(el, { ...opts, animate: false });
    expect(seriesPath(el).getAttribute('stroke-dashoffset')).toBeNull();
  });

  it('does not replay draw-on on data updates (enter-only)', () => {
    const el = mount();
    const chart = new Chart(el, { ...opts, animate: 'apex' });
    scheduler.flush(0);
    scheduler.flush(3000);
    chart.appendData({ t: 3, v: 5 });
    const off = seriesPath(el).getAttribute('stroke-dashoffset');
    expect(off === null || off === '0').toBe(true);
  });

  it('pops markers from radius 0 when markers are enabled', () => {
    const el = mount();
    new Chart(el, { ...opts, animate: 'apex', markers: true });
    const dot = el.querySelector('.vitecharts-markers circle') as SVGCircleElement;
    expect(dot.getAttribute('r')).toBe('0');
    scheduler.flush(0);
    scheduler.flush(5000);
    expect(Number(dot.getAttribute('r'))).toBeGreaterThan(0);
  });
});
