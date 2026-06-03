import { line as d3line } from 'd3-shape';
import type { NodeHandle, Renderer } from '../renderer/types.js';
import { curveFor } from './curves.js';
import type { LineStyle, PixelPoint } from './types.js';

/** Build the SVG path `d` string for a polyline through pixel points. */
export function linePath(points: PixelPoint[], style: LineStyle): string {
  const generator = d3line<PixelPoint>()
    .defined((p) => Number.isFinite(p.y)) // break the line at NaN (null gaps)
    .x((p) => p.x)
    .y((p) => p.y)
    .curve(curveFor(style.curve));
  return generator(points) ?? '';
}

export function drawLine(
  renderer: Renderer,
  points: PixelPoint[],
  style: LineStyle,
  parent?: NodeHandle,
): NodeHandle {
  return renderer.path(
    {
      d: linePath(points, style),
      fill: 'none',
      stroke: style.stroke,
      'stroke-width': style.width ?? 2,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      ...(style.dash ? { 'stroke-dasharray': style.dash } : {}),
    },
    parent,
  );
}
