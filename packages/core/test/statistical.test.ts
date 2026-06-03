import { describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';

function mount(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
  document.body.appendChild(el);
  return el;
}

describe('candlestick', () => {
  it('draws a body rect + wick line per candle, colored by direction', () => {
    const el = mount();
    new Chart(el, {
      type: 'candlestick',
      data: [
        { d: 'Mon', o: 10, h: 16, l: 8, c: 14 }, // up
        { d: 'Tue', o: 14, h: 15, l: 9, c: 10 }, // down
      ],
      x: 'd',
      series: [{ y: 'c', open: 'o', high: 'h', low: 'l', close: 'c' }],
      width: 600,
      animate: false,
    });
    expect(el.querySelectorAll('.vitecharts-series rect').length).toBe(2);
    expect(el.querySelectorAll('.vitecharts-series line').length).toBe(2);
  });
});

describe('boxplot', () => {
  it('draws box + median + whiskers per datum', () => {
    const el = mount();
    new Chart(el, {
      type: 'boxplot',
      data: [{ g: 'A', min: 1, q1: 3, med: 5, q3: 7, max: 9 }],
      x: 'g',
      series: [{ y: 'med', low: 'min', q1: 'q1', median: 'med', q3: 'q3', high: 'max' }],
      width: 600,
      animate: false,
    });
    expect(el.querySelector('.vitecharts-series rect')).not.toBeNull();
    // 2 whiskers + 2 caps + 1 median = 5 lines
    expect(el.querySelectorAll('.vitecharts-series line').length).toBe(5);
  });
});

describe('range area / bar', () => {
  it('rangeArea draws a band (area + 2 boundary lines)', () => {
    const el = mount();
    new Chart(el, {
      type: 'rangeArea',
      data: [
        { x: 'A', lo: 2, hi: 8 },
        { x: 'B', lo: 3, hi: 10 },
      ],
      x: 'x',
      series: [{ y: 'hi', low: 'lo', high: 'hi' }],
      width: 600,
      animate: false,
    });
    expect(el.querySelectorAll('.vitecharts-series path').length).toBe(3); // area + hi + lo
  });

  it('rangeBar draws a floating bar per datum', () => {
    const el = mount();
    new Chart(el, {
      type: 'rangeBar',
      data: [{ x: 'A', lo: 2, hi: 8 }],
      x: 'x',
      series: [{ y: 'hi', low: 'lo', high: 'hi' }],
      width: 600,
      animate: false,
    });
    expect(el.querySelectorAll('.vitecharts-series rect').length).toBe(1);
  });
});

describe('funnel', () => {
  it('draws a trapezoid per stage', () => {
    const el = mount();
    new Chart(el, {
      type: 'funnel',
      data: [
        { s: 'Visits', v: 100 },
        { s: 'Signups', v: 60 },
        { s: 'Paid', v: 20 },
      ],
      x: 's',
      series: [{ y: 'v' }],
      width: 600,
      animate: false,
    });
    expect(el.querySelectorAll('.vitecharts-funnel path').length).toBe(3);
  });
});

describe('heatmap', () => {
  it('draws a cell per (row series × column) and a visualMap legend', () => {
    const el = mount();
    new Chart(el, {
      type: 'heatmap',
      data: [
        { h: '12a', mon: 1, tue: 2 },
        { h: '1a', mon: 3, tue: 4 },
        { h: '2a', mon: 5, tue: 6 },
      ],
      x: 'h',
      series: [
        { y: 'mon', name: 'Mon' },
        { y: 'tue', name: 'Tue' },
      ],
      width: 600,
      animate: false,
    });
    // 2 rows x 3 cols = 6 cells + 1 legend bar = 7 rects
    expect(el.querySelectorAll('.vitecharts-heatmap rect').length).toBe(7);
  });
});
