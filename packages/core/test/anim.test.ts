import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSpring } from '../src/anim/spring.js';
import { scheduler } from '../src/anim/scheduler.js';
import { tween } from '../src/anim/tween.js';
import { resolveAnimation } from '../src/anim/presets.js';

// Drive the scheduler manually for deterministic frame timing.
beforeAll(() => scheduler.setAuto(false));
afterAll(() => scheduler.setAuto(true));

describe('createSpring', () => {
  it('converges to the target and reports done', () => {
    const step = createSpring(0, 100);
    let last = { value: 0, velocity: 0, done: false };
    for (let i = 0; i < 600 && !last.done; i++) last = step(16);
    expect(last.done).toBe(true);
    expect(last.value).toBeCloseTo(100, 1);
  });
});

describe('tween', () => {
  it('completes synchronously when duration <= 0', () => {
    const seen: number[] = [];
    let completed = false;
    tween({ duration: 0, onUpdate: (e) => seen.push(e), onComplete: () => (completed = true) });
    expect(seen).toEqual([1]);
    expect(completed).toBe(true);
  });

  it('progresses across frames and completes', () => {
    const seen: number[] = [];
    let completed = false;
    const h = tween({
      duration: 1000,
      onUpdate: (e) => seen.push(e),
      onComplete: () => (completed = true),
    });
    scheduler.flush(0); // sets start, progress 0
    scheduler.flush(500); // halfway
    expect(seen.at(-1)).toBeCloseTo(0.5, 5);
    scheduler.flush(1000); // done
    expect(completed).toBe(true);
    expect(h.done).toBe(true);
    expect(seen.at(-1)).toBe(1);
  });

  it('cancel stops updates and does not complete', () => {
    let completed = false;
    let updates = 0;
    const h = tween({
      duration: 1000,
      onUpdate: () => updates++,
      onComplete: () => (completed = true),
    });
    scheduler.flush(0);
    const countAtCancel = updates;
    h.cancel();
    scheduler.flush(500);
    expect(updates).toBe(countAtCancel);
    expect(completed).toBe(false);
    expect(h.done).toBe(true);
  });
});

describe('resolveAnimation', () => {
  it('defaults to the enabled apex preset', () => {
    const cfg = resolveAnimation(undefined, false);
    expect(cfg.enabled).toBe(true);
    expect(cfg.duration).toBe(800);
  });

  it('disables on false, preset "none", and reduced motion', () => {
    expect(resolveAnimation(false, false).enabled).toBe(false);
    expect(resolveAnimation('none', false).enabled).toBe(false);
    expect(resolveAnimation('apex', true).enabled).toBe(false);
  });

  it('honors explicit overrides', () => {
    const cfg = resolveAnimation({ duration: 1234, easing: 'linear' }, false);
    expect(cfg.duration).toBe(1234);
    expect(cfg.easing(0.3)).toBe(0.3);
  });
});
