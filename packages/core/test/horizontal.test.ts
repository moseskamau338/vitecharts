import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

const data = [
  { lang: 'TypeScript', stars: 13 },
  { lang: 'Python', stars: 11 },
  { lang: 'Rust', stars: 9 },
  { lang: 'Go', stars: 6 },
];

describe('horizontal bars', () => {
  it('draws one rect per datum with category labels on the y axis', () => {
    const el = mount();
    new Chart(el, {
      type: 'bar',
      data,
      x: 'lang',
      series: [{ y: 'stars', name: 'Stars' }],
      horizontal: true,
      width: 600,
      animate: false,
    });
    expect(el.querySelectorAll('.vitecharts-series rect').length).toBe(4);
    expect(el.querySelectorAll('.vitecharts-yaxis text').length).toBe(4);
  });

  it('grows bars by width and shows data labels', () => {
    const el = mount();
    new Chart(el, {
      type: 'bar',
      data,
      x: 'lang',
      series: [{ y: 'stars' }],
      horizontal: true,
      dataLabels: true,
      width: 600,
      animate: false,
    });
    const rects = el.querySelectorAll('.vitecharts-series rect');
    // widest bar (TypeScript = 13) should be wider than the narrowest (Go = 6)
    const widths = [...rects].map((r) => Number(r.getAttribute('width')));
    expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths));
    expect(el.querySelectorAll('.vitecharts-series text').length).toBe(4);
  });
});
