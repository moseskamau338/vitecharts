import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';
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
    { t: 'A', v: 10, w: 4 },
    { t: 'B', v: 30, w: 8 },
    { t: 'C', v: 20, w: 6 },
  ],
  x: 't',
  series: [{ y: 'v' }, { y: 'w' }],
  width: 600,
  animate: false,
};

function move(el: HTMLElement, clientX: number): void {
  const svg = el.querySelector('svg') as SVGSVGElement;
  svg.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY: 100, bubbles: true }));
}

describe('interaction layer', () => {
  it('creates a tooltip element by default', () => {
    const el = mount();
    new Chart(el, opts);
    expect(el.querySelector('.vitecharts-tooltip')).not.toBeNull();
  });

  it('shows the tooltip and a crosshair on hover, hides on leave', () => {
    const el = mount();
    new Chart(el, opts);
    move(el, 300);
    const tip = el.querySelector('.vitecharts-tooltip') as HTMLElement;
    expect(tip.style.opacity).toBe('1');
    expect(tip.querySelectorAll('.vc-tt-row').length).toBe(2); // both series
    expect(el.querySelector('.vitecharts-crosshair')).not.toBeNull();

    const svg = el.querySelector('svg') as SVGSVGElement;
    svg.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(tip.style.opacity).toBe('0');
    expect(el.querySelector('.vitecharts-crosshair')).toBeNull();
  });

  it('emits pointerMove with the hovered group', () => {
    const el = mount();
    const chart = new Chart(el, opts);
    let count = 0;
    chart.on('pointerMove', ({ group }) => {
      count++;
      expect(group.points.length).toBe(2);
    });
    move(el, 300);
    expect(count).toBe(1);
  });

  it('renders a legend and toggling hides a series', () => {
    const el = mount();
    const chart = new Chart(el, { ...opts, legend: true });
    expect(el.querySelectorAll('.vitecharts-legend button').length).toBe(2);
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(2);

    let toggled = false;
    chart.on('legendClick', ({ seriesIndex, hidden }) => {
      toggled = true;
      expect(seriesIndex).toBe(0);
      expect(hidden).toBe(true);
    });
    (el.querySelector('.vitecharts-legend button') as HTMLButtonElement).click();
    expect(toggled).toBe(true);
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(1); // one hidden
  });

  it('tooltip:false disables the tooltip', () => {
    const el = mount();
    new Chart(el, { ...opts, tooltip: false });
    expect(el.querySelector('.vitecharts-tooltip')).toBeNull();
  });

  it('destroy removes tooltip and legend', () => {
    const el = mount();
    const chart = new Chart(el, { ...opts, legend: true });
    chart.destroy();
    expect(el.querySelector('.vitecharts-tooltip')).toBeNull();
    expect(el.querySelector('.vitecharts-legend')).toBeNull();
  });
});
