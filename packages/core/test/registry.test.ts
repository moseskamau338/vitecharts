import { describe, expect, it } from 'vitest';
import { Chart, cartesian, registerChart, registerCharts } from '../src/lean.js';
import type { ChartOptions, ChartType } from '../src/lean.js';

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

const opts: ChartOptions = {
  type: 'line',
  data: [
    { m: 'a', v: 1 },
    { m: 'b', v: 2 },
  ],
  x: 'm',
  series: [{ y: 'v' }],
  width: 600,
  animate: false,
};

// NOTE: the `lean` entry registers nothing on import — these run in order and
// share the module-global registry.
describe('lean entry / registerable charts', () => {
  it('throws a helpful error for an unregistered chart type', () => {
    const el = mount();
    expect(() => new Chart(el, opts)).toThrow(/not registered/);
  });

  it('renders after registering the cartesian plugin', () => {
    registerCharts(cartesian);
    const el = mount();
    new Chart(el, opts);
    expect(el.querySelector('.vitecharts-series path')).not.toBeNull();
  });

  it('registerChart adds a custom chart type', () => {
    const custom: ChartType = {
      render: (ctx) => {
        ctx.renderer.rect({ x: 0, y: 0, width: 10, height: 10, fill: '#000' });
      },
    };
    registerChart('custom', custom);
    const el = mount();
    new Chart(el, { ...opts, type: 'custom' as ChartOptions['type'] });
    expect(el.querySelector('rect')).not.toBeNull();
  });
});
