import { describe, expect, it } from 'vitest';
import { compileSpec } from '../src/spec/compile.js';
import type { ChartOptions } from '../src/types.js';

const base: ChartOptions = {
  type: 'line',
  data: [{ m: 'Jan', v: 10 }],
  x: 'm',
  series: [{ y: 'v' }],
};

describe('compileSpec', () => {
  it('fills defaults: padding, axis ticks, series name/color', () => {
    const spec = compileSpec(base);
    expect(spec.padding).toEqual({ top: 20, right: 24, bottom: 32, left: 48 });
    expect(spec.xAxis.ticks).toBe(6);
    expect(spec.yAxis.ticks).toBe(5);
    expect(spec.series[0]?.name).toBe('v');
    expect(spec.series[0]?.color).toMatch(/^#/);
    expect(spec.series[0]?.curve).toBe('linear');
  });

  it('applies the dark theme', () => {
    const spec = compileSpec({ ...base, theme: 'dark' });
    expect(spec.theme.background).toBe('#241E1A');
  });

  it('lets colors override the theme palette', () => {
    const spec = compileSpec({ ...base, colors: ['#abcdef'] });
    expect(spec.series[0]?.color).toBe('#abcdef');
  });

  it('copies data (does not alias the input array)', () => {
    const spec = compileSpec(base);
    expect(spec.data).not.toBe(base.data);
    expect(spec.data).toEqual(base.data);
  });

  it('throws helpful errors on invalid input', () => {
    expect(() => compileSpec({ ...base, series: [] })).toThrow(/non-empty/);
    // @ts-expect-error intentionally wrong
    expect(() => compileSpec({ ...base, x: 123 })).toThrow(/string key/);
    // @ts-expect-error intentionally wrong
    expect(() => compileSpec({ ...base, data: null })).toThrow(/array/);
  });
});
