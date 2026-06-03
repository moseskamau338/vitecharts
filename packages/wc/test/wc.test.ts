import { describe, expect, it } from 'vitest';
import '../src/index.js';
import type { ViteChartElement } from '../src/index.js';

const options = {
  type: 'line' as const,
  data: [
    { m: 'A', v: 1 },
    { m: 'B', v: 3 },
  ],
  x: 'm',
  series: [{ y: 'v' }],
  width: 400,
  animate: false as const,
};

describe('<vitecharts-chart>', () => {
  it('registers the custom element', () => {
    expect(customElements.get('vitecharts-chart')).toBeDefined();
  });

  it('renders an svg when options are set', () => {
    const el = document.createElement('vitecharts-chart') as ViteChartElement;
    document.body.appendChild(el);
    el.options = options;
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.chartInstance).not.toBeNull();
  });

  it('updates in place and tears down on disconnect', () => {
    const el = document.createElement('vitecharts-chart') as ViteChartElement;
    document.body.appendChild(el);
    el.options = options;
    el.options = { ...options, series: [{ y: 'v' }, { y: 'm' }] };
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(2);
    el.remove();
    expect(el.querySelector('svg')).toBeNull();
  });
});
