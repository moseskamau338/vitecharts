import { describe, expect, it } from 'vitest';
import { buildColorScale, buildScale } from '../src/scales/index.js';

describe('buildScale', () => {
  it('infers a linear scale for numbers and maps the range', () => {
    const s = buildScale([0, 50, 100], [0, 200], { type: 'linear' });
    expect(s.type).toBe('linear');
    expect(s.map(0)).toBe(0);
    expect(s.map(100)).toBe(200);
    expect(s.map(50)).toBe(100);
  });

  it('includes zero in the domain when `zero` is set', () => {
    const s = buildScale([20, 40, 60], [100, 0], { zero: true });
    // baseline (value 0) should map to the bottom of the range
    expect(s.map(0)).toBe(100);
  });

  it('infers a time scale for dates', () => {
    const s = buildScale([new Date('2020-01-01'), new Date('2020-12-31')], [0, 100]);
    expect(s.type).toBe('time');
    expect(s.map(new Date('2020-01-01'))).toBeCloseTo(0, 5);
  });

  it('builds a band scale with bandwidth for categories', () => {
    const s = buildScale(['a', 'b', 'c'], [0, 300], { type: 'band', padding: 0 });
    expect(s.type).toBe('band');
    expect(s.bandwidth).toBeCloseTo(100, 5);
    expect(s.ticks()).toEqual(['a', 'b', 'c']);
  });

  it('handles a degenerate (flat) domain without NaN', () => {
    const s = buildScale([5, 5, 5], [0, 100], { type: 'linear' });
    expect(Number.isNaN(s.map(5))).toBe(false);
  });
});

describe('buildColorScale', () => {
  it('cycles palette colors across the domain', () => {
    const color = buildColorScale(['x', 'y', 'z'], ['#f00', '#0f0']);
    expect(color('x')).toBe('#f00');
    expect(color('y')).toBe('#0f0');
    expect(color('z')).toBe('#f00');
  });
});
