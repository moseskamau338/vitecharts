import { describe, expect, it } from 'vitest';
import { arcPath, areaPath, linePath } from '../src/marks/index.js';
import { SvgRenderer } from '../src/renderer/svg.js';
import { drawBar, drawPoints } from '../src/marks/index.js';

describe('mark path builders', () => {
  it('linePath produces an SVG path starting with a move command', () => {
    const d = linePath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 5 },
      ],
      { stroke: '#000' },
    );
    expect(d.startsWith('M')).toBe(true);
  });

  it('areaPath closes the shape (contains a Z)', () => {
    const d = areaPath(
      [
        { x: 0, y: 0, y0: 10 },
        { x: 10, y: 2, y0: 10 },
      ],
      { fill: '#000' },
    );
    expect(d).toMatch(/Z/i);
  });

  it('arcPath builds a non-empty donut slice', () => {
    const d = arcPath({ innerRadius: 20, outerRadius: 40, startAngle: 0, endAngle: Math.PI });
    expect(d.length).toBeGreaterThan(0);
    expect(d.startsWith('M')).toBe(true);
  });
});

describe('mark drawing', () => {
  it('drawPoints renders one circle per point', () => {
    const el = document.createElement('div');
    const r = new SvgRenderer(el);
    drawPoints(
      r,
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
      { fill: '#000' },
    );
    expect(el.querySelectorAll('circle').length).toBe(2);
  });

  it('drawBar clamps negative dimensions to zero', () => {
    const el = document.createElement('div');
    const r = new SvgRenderer(el);
    drawBar(r, { x: 0, y: 0, width: -5, height: 10 }, { fill: '#000' });
    expect(el.querySelector('rect')?.getAttribute('width')).toBe('0');
  });
});
