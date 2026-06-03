import { describe, expect, it } from 'vitest';
import { computed, effect, signal } from '../src/reactive/signal.js';

describe('reactive signals', () => {
  it('re-runs an effect when a read signal changes', () => {
    const count = signal(0);
    const seen: number[] = [];
    effect(() => seen.push(count.value));
    expect(seen).toEqual([0]);
    count.value = 1;
    count.value = 2;
    expect(seen).toEqual([0, 1, 2]);
  });

  it('does not re-run when the value is unchanged (Object.is)', () => {
    const s = signal(5);
    let runs = 0;
    effect(() => {
      void s.value;
      runs++;
    });
    s.value = 5;
    expect(runs).toBe(1);
  });

  it('stops re-running after dispose', () => {
    const s = signal(0);
    const seen: number[] = [];
    const dispose = effect(() => seen.push(s.value));
    s.value = 1;
    dispose();
    s.value = 2;
    expect(seen).toEqual([0, 1]);
  });

  it('computed derives and updates', () => {
    const n = signal(2);
    const doubled = computed(() => n.value * 2);
    expect(doubled.value).toBe(4);
    n.value = 10;
    expect(doubled.value).toBe(20);
  });
});
