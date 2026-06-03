import { beforeAll, describe, expect, it } from 'vitest';
import { CanvasRenderer } from '../src/renderer/canvas.js';

// jsdom ships no 2D canvas backend; stub getContext to null (which the renderer
// already handles) so we don't emit noisy "Not implemented" logs.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
});

describe('CanvasRenderer (stub)', () => {
  it('mounts a canvas element', () => {
    const el = document.createElement('div');
    new CanvasRenderer(el);
    expect(el.querySelector('canvas.vitecharts-canvas')).not.toBeNull();
  });

  it('sizes the backing store by devicePixelRatio', () => {
    const el = document.createElement('div');
    const r = new CanvasRenderer(el, 2); // force dpr = 2
    r.resize(300, 150);
    expect(r.mount.style.width).toBe('300px');
    expect(r.mount.style.height).toBe('150px');
    expect(r.mount.width).toBe(600);
    expect(r.mount.height).toBe(300);
  });

  it('destroy removes the canvas', () => {
    const el = document.createElement('div');
    const r = new CanvasRenderer(el);
    r.destroy();
    expect(el.querySelector('canvas')).toBeNull();
  });
});
