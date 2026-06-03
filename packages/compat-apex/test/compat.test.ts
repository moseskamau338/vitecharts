import { describe, expect, it } from 'vitest';
import { fromApex } from '../src/index.js';

describe('fromApex', () => {
  it('maps a categorical bar chart', () => {
    const out = fromApex({
      chart: { type: 'bar' },
      series: [
        { name: 'Sales', data: [30, 40, 50] },
        { name: 'Cost', data: [12, 18, 22] },
      ],
      xaxis: { categories: ['Q1', 'Q2', 'Q3'] },
    });
    expect(out.type).toBe('bar');
    expect(out.x).toBe('x');
    expect(out.series).toHaveLength(2);
    expect(out.series[0]).toMatchObject({ y: 'y0', name: 'Sales' });
    expect(out.data).toHaveLength(3);
    expect(out.data[0]).toEqual({ x: 'Q1', y0: 30, y1: 12 });
  });

  it('maps column -> bar and smooth stroke -> curve', () => {
    const out = fromApex({
      chart: { type: 'column' },
      stroke: { curve: 'smooth' },
      series: [{ name: 'A', data: [1, 2] }],
      xaxis: { categories: ['a', 'b'] },
    });
    expect(out.type).toBe('bar');
    expect(out.series[0]?.curve).toBe('smooth');
  });

  it('maps a donut from labels + numeric series', () => {
    const out = fromApex({
      chart: { type: 'donut' },
      labels: ['A', 'B', 'C'],
      series: [10, 20, 30],
    });
    expect(out.type).toBe('donut');
    expect(out.x).toBe('label');
    expect(out.data).toEqual([
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 30 },
    ]);
  });

  it('maps [x, y] tuple data without categories', () => {
    const out = fromApex({
      chart: { type: 'line' },
      series: [
        {
          name: 'S',
          data: [
            [1, 10],
            [2, 20],
          ],
        },
      ],
    });
    expect(out.data).toEqual([
      { x: 1, y0: 10 },
      { x: 2, y0: 20 },
    ]);
  });

  it('carries colors, dark theme, title, and legend', () => {
    const out = fromApex({
      chart: { type: 'line' },
      series: [{ data: [1] }],
      xaxis: { categories: ['a'] },
      colors: ['#f00'],
      theme: { mode: 'dark' },
      title: { text: 'Revenue' },
      legend: { show: false },
    });
    expect(out.colors).toEqual(['#f00']);
    expect(out.theme).toBe('dark');
    expect(out.ariaLabel).toBe('Revenue');
    expect(out.legend).toBe(false);
  });
});
