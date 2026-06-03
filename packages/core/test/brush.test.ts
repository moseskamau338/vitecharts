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
    { t: 'A', v: 10 },
    { t: 'B', v: 30 },
    { t: 'C', v: 20 },
    { t: 'D', v: 40 },
  ],
  x: 't',
  series: [{ y: 'v' }],
  width: 600,
  animate: false,
};

function drag(el: HTMLElement, x0: number, x1: number): void {
  const svg = el.querySelector('svg') as SVGSVGElement;
  svg.dispatchEvent(new MouseEvent('mousedown', { clientX: x0, clientY: 50, bubbles: true }));
  svg.dispatchEvent(new MouseEvent('mousemove', { clientX: x1, clientY: 50, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: x1, clientY: 50, bubbles: true }));
}

describe('brush', () => {
  it('emits brushSelection with data values after a drag', () => {
    const el = mount();
    const chart = new Chart(el, { ...opts, brush: true });
    let payload: { x0: unknown; x1: unknown } | null = null;
    chart.on('brushSelection', (p) => (payload = p));
    drag(el, 120, 460);
    expect(payload).not.toBeNull();
    expect(payload!.x0).toBeDefined();
    expect(payload!.x1).toBeDefined();
  });

  it('draws a selection rect while dragging', () => {
    const el = mount();
    new Chart(el, { ...opts, brush: true });
    const svg = el.querySelector('svg') as SVGSVGElement;
    svg.dispatchEvent(new MouseEvent('mousedown', { clientX: 120, clientY: 50, bubbles: true }));
    svg.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 50, bubbles: true }));
    expect(el.querySelector('.vitecharts-brush')).not.toBeNull();
  });
});

describe('sync groups', () => {
  it('mirrors hover crosshair to a peer in the same group', () => {
    const a = mount();
    const b = mount();
    new Chart(a, { ...opts, group: 'g1' });
    new Chart(b, { ...opts, group: 'g1' });

    const svgA = a.querySelector('svg') as SVGSVGElement;
    svgA.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 50, bubbles: true }));

    // peer b should show a crosshair even though it wasn't hovered directly
    expect(b.querySelector('.vitecharts-crosshair')).not.toBeNull();
  });
});
