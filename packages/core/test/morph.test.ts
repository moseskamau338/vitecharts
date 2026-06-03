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
  type: 'bar',
  data: [
    { q: 'A', v: 10 },
    { q: 'B', v: 20 },
  ],
  x: 'q',
  series: [{ y: 'v' }],
  width: 600,
  animate: 'apex',
};

function firstBarHeight(el: HTMLElement): number {
  return Number(el.querySelector('.vitecharts-series rect')?.getAttribute('height'));
}

describe('update-morph (FLIP)', () => {
  it('morphs bars from their previous geometry on data update', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    scheduler.flush(0);
    scheduler.flush(3000); // finish enter
    const oldH = firstBarHeight(el);
    expect(oldH).toBeGreaterThan(0);

    chart.setData([
      { q: 'A', v: 40 }, // A grows
      { q: 'B', v: 20 },
    ]);
    // morph starts at the previous height...
    expect(firstBarHeight(el)).toBeCloseTo(oldH, 0);
    scheduler.flush(0);
    scheduler.flush(3000);
    // ...and ends taller (value 10 → 40)
    expect(firstBarHeight(el)).toBeGreaterThan(oldH);
  });

  it('counts data labels up to the new value', () => {
    const el = mount();
    const chart = new Chart(el, { ...opts, dataLabels: true });
    scheduler.flush(0);
    scheduler.flush(3000);
    expect(el.querySelector('.vitecharts-labels text')?.textContent).toBe('10');

    chart.setData([
      { q: 'A', v: 40 },
      { q: 'B', v: 20 },
    ]);
    // count-up begins at the old value
    expect(el.querySelector('.vitecharts-labels text')?.textContent).toBe('10');
    scheduler.flush(0);
    scheduler.flush(3000);
    expect(el.querySelector('.vitecharts-labels text')?.textContent).toBe('40');
  });
});

describe('hover emphasis', () => {
  it('draws emphasis rings on hover and clears them on leave', () => {
    const el = mount();
    new Chart(el, { ...opts, animate: false });
    const svg = el.querySelector('svg') as SVGSVGElement;
    svg.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 100, bubbles: true }));
    expect(el.querySelectorAll('.vitecharts-emphasis').length).toBeGreaterThan(0);
    svg.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(el.querySelectorAll('.vitecharts-emphasis').length).toBe(0);
  });
});
