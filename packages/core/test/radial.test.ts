import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';
import type { ChartOptions, ChartTypeName } from '../src/types.js';

const data = [
  { label: 'A', v: 30 },
  { label: 'B', v: 20 },
  { label: 'C', v: 50 },
];

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 400, configurable: true });
  document.body.appendChild(el);
  return el;
}

function make(type: ChartTypeName, extra: Partial<ChartOptions> = {}): HTMLElement {
  const el = mount();
  new Chart(el, {
    type,
    data,
    x: 'label',
    series: [{ y: 'v' }],
    width: 400,
    height: 400,
    animate: false,
    ...extra,
  });
  return el;
}

describe('radial chart types', () => {
  it('pie: one arc path per slice, centered group', () => {
    const el = make('pie');
    expect(el.querySelectorAll('.vitecharts-radial path').length).toBe(3);
    expect(el.querySelector('.vitecharts-radial')?.getAttribute('transform')).toMatch(/translate/);
  });

  it('donut: renders slices plus a center total label', () => {
    const el = make('donut');
    expect(el.querySelectorAll('.vitecharts-radial path').length).toBe(3);
    expect(el.querySelector('.vitecharts-radial text')?.textContent).toBe('100');
  });

  it('polarArea: one arc per slice', () => {
    const el = make('polarArea');
    expect(el.querySelectorAll('.vitecharts-radial path').length).toBe(3);
  });

  it('radialBar: a track + value arc per ring', () => {
    const el = make('radialBar');
    // 3 rows x (track + value) = 6 paths
    expect(el.querySelectorAll('.vitecharts-radial path').length).toBe(6);
  });

  it('radar: grid rings + a polygon per series', () => {
    const el = mount();
    new Chart(el, {
      type: 'radar',
      data,
      x: 'label',
      series: [{ y: 'v' }, { y: 'v' }],
      width: 400,
      height: 400,
      animate: false,
    });
    // 4 grid rings + 2 series polygons = 6 paths
    expect(el.querySelectorAll('.vitecharts-radial path').length).toBe(6);
  });
});
