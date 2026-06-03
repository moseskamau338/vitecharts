import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';
import type { ChartOptions } from '../src/types.js';

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

const numericData = Array.from({ length: 10 }, (_, i) => ({ t: i, v: i * i }));

const base: ChartOptions = {
  type: 'line',
  data: numericData,
  x: 't',
  series: [{ y: 'v' }],
  width: 600,
  animate: false,
  markers: true,
  zoom: true,
};

describe('zoom', () => {
  it('zoomIn narrows the window and reduces visible points; reset restores', () => {
    const el = mount();
    const chart = new Chart(el, base);
    const before = el.querySelectorAll('.vitecharts-markers circle').length;
    expect(before).toBe(10);

    let zoomed: { min: number; max: number } | null = null;
    chart.on('zoomed', (z) => (zoomed = z));

    chart.zoomIn();
    expect(zoomed).not.toBeNull();
    expect(zoomed!.min).toBeGreaterThanOrEqual(0);
    expect(zoomed!.max).toBeLessThanOrEqual(9);
    expect(el.querySelectorAll('.vitecharts-markers circle').length).toBeLessThan(before);

    chart.resetZoom();
    expect(el.querySelectorAll('.vitecharts-markers circle').length).toBe(10);
  });

  it('zoomed event fires null on reset', () => {
    const el = mount();
    const chart = new Chart(el, base);
    chart.zoomIn();
    let last: unknown = 'x';
    chart.on('zoomed', (z) => (last = z));
    chart.resetZoom();
    expect(last).toBeNull();
  });
});

describe('toolbar', () => {
  it('renders zoom buttons + an export menu for numeric x', () => {
    const el = mount();
    new Chart(el, { ...base, toolbar: true });
    const buttons = el.querySelectorAll('.vitecharts-toolbar button');
    // zoom in, zoom out, reset, menu = 4
    expect(buttons.length).toBe(4);
  });

  it('omits zoom buttons for categorical x (export only)', () => {
    const el = mount();
    new Chart(el, {
      type: 'bar',
      data: [{ q: 'Q1', v: 1 }],
      x: 'q',
      series: [{ y: 'v' }],
      width: 600,
      animate: false,
      toolbar: true,
    });
    expect(el.querySelectorAll('.vitecharts-toolbar button').length).toBe(1); // menu only
  });

  it('export menu lists the four formats', () => {
    const el = mount();
    new Chart(el, { ...base, toolbar: true });
    const menuBtn = [...el.querySelectorAll('.vitecharts-toolbar button')].at(
      -1,
    ) as HTMLButtonElement;
    menuBtn.click();
    const items = el.querySelectorAll('.vitecharts-toolbar div button');
    expect(items.length).toBe(4);
  });
});
