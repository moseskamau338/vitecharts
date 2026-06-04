import { describe, expect, it } from 'vitest';
import { Chart, lightTheme, resolveTheme } from '../src/index.js';
import type { ChartOptions } from '../src/types.js';

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

const opts: ChartOptions = {
  type: 'line',
  data: [
    { m: 'A', v: 1 },
    { m: 'B', v: 2 },
  ],
  x: 'm',
  series: [{ y: 'v' }],
  width: 600,
  animate: false,
};

describe('warm theme defaults', () => {
  it('light theme is the default and is warm (terracotta first color)', () => {
    expect(resolveTheme().colors[0]).toBe('#C75D3A');
    expect(lightTheme.background).toBe('#ffffff');
    expect(lightTheme.tooltipBg).toBe('#2A2420'); // inverted dark tooltip
  });

  it('uses a monospace font for chart labels', () => {
    expect(lightTheme.fontFamily).toMatch(/mono/i);
  });
});

describe("theme: 'css' (CSS-variable theming)", () => {
  it('reads --vc-* and --c* custom properties from the container', () => {
    const el = mount();
    el.style.setProperty('--c1', '#123456');
    el.style.setProperty('--vc-grid', '#abcdef');
    el.style.setProperty('--vc-axis', '#fedcba');
    new Chart(el, { ...opts, theme: 'css' });

    expect(el.querySelector('.vitecharts-grid line')?.getAttribute('stroke')).toBe('#abcdef');
    expect(el.querySelector('.vitecharts-xaxis line')?.getAttribute('stroke')).toBe('#fedcba');
    expect(el.querySelector('.vitecharts-series path')?.getAttribute('stroke')).toBe('#123456');
  });

  it('falls back to the light theme for unset variables', () => {
    const el = mount();
    new Chart(el, { ...opts, theme: 'css' }); // no vars set
    expect(el.querySelector('.vitecharts-series path')?.getAttribute('stroke')).toBe('#C75D3A');
  });
});
