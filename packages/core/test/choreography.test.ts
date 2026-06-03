import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { animateAttr, animateBarGrow, animateDrawOn } from '../src/anim/choreography.js';
import { resolveAnimation } from '../src/anim/presets.js';
import { scheduler } from '../src/anim/scheduler.js';
import { SvgRenderer } from '../src/renderer/svg.js';

const ENABLED = resolveAnimation('apex', false);
const DISABLED = resolveAnimation(false, false);

beforeAll(() => scheduler.setAuto(false));
afterAll(() => scheduler.setAuto(true));

function path() {
  const el = document.createElement('div');
  const r = new SvgRenderer(el);
  return r.path({ d: 'M0,0L10,10' });
}

describe('choreography', () => {
  it('animateDrawOn hides the stroke initially, then reveals it', () => {
    const p = path();
    const h = animateDrawOn(p, 100, ENABLED);
    expect(h).not.toBeNull();
    // initially fully offset (hidden)
    expect(Number((p as unknown as { el: SVGElement }).el.getAttribute('stroke-dashoffset'))).toBe(
      100,
    );
    scheduler.flush(0);
    scheduler.flush(2000);
    const el = (p as unknown as { el: SVGElement }).el;
    expect(el.getAttribute('stroke-dashoffset')).toBe('0');
    expect(el.getAttribute('stroke-dasharray')).toBe('none');
  });

  it('is a no-op when animation is disabled', () => {
    const p = path();
    const el = (p as unknown as { el: SVGElement }).el;
    expect(animateDrawOn(p, 100, DISABLED)).toBeNull();
    expect(el.getAttribute('stroke-dashoffset')).toBeNull();
  });

  it('animateBarGrow grows from the baseline', () => {
    const el = document.createElement('div');
    const r = new SvgRenderer(el);
    const rect = r.rect({ x: 0, y: 50, width: 10, height: 50 });
    const node = (rect as unknown as { el: SVGElement }).el;
    animateBarGrow(rect, 50, 50, 100, ENABLED);
    expect(node.getAttribute('height')).toBe('0'); // starts collapsed
    scheduler.flush(0);
    scheduler.flush(2000);
    expect(node.getAttribute('height')).toBe('50');
    expect(node.getAttribute('y')).toBe('50');
  });

  it('animateAttr returns null when disabled', () => {
    const p = path();
    expect(animateAttr(p, 'r', 0, 5, DISABLED)).toBeNull();
  });
});
