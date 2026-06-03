import { describe, expect, it } from 'vitest';
import { EASINGS } from '../src/anim/easing.js';

describe('easing functions', () => {
  it('all map endpoints 0->0 and 1->1', () => {
    for (const [name, fn] of Object.entries(EASINGS)) {
      expect(fn(0), `${name}(0)`).toBeCloseTo(0, 5);
      expect(fn(1), `${name}(1)`).toBeCloseTo(1, 5);
    }
  });

  it('linear is the identity', () => {
    expect(EASINGS.linear(0.42)).toBe(0.42);
  });

  it('easeInOutQuad is symmetric at the midpoint', () => {
    expect(EASINGS.easeInOutQuad(0.5)).toBeCloseTo(0.5, 5);
  });

  it('easeOutBack overshoots past 1 before settling', () => {
    const peak = Math.max(
      ...Array.from({ length: 99 }, (_, i) => EASINGS.easeOutBack((i + 1) / 100)),
    );
    expect(peak).toBeGreaterThan(1);
  });
});
