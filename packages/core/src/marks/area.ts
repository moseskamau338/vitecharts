import { area as d3area } from 'd3-shape';
import type { NodeHandle, Renderer } from '../renderer/types.js';
import { curveFor } from './curves.js';
import type { AreaStyle, PixelPoint } from './types.js';

/** A point plus its baseline (`y0`) for area fills. */
export interface AreaPoint extends PixelPoint {
  y0: number;
}

export function areaPath(points: AreaPoint[], style: AreaStyle): string {
  const generator = d3area<AreaPoint>()
    .x((p) => p.x)
    .y0((p) => p.y0)
    .y1((p) => p.y)
    .curve(curveFor(style.curve));
  return generator(points) ?? '';
}

export function drawArea(
  renderer: Renderer,
  points: AreaPoint[],
  style: AreaStyle,
  parent?: NodeHandle,
): NodeHandle {
  return renderer.path(
    {
      d: areaPath(points, style),
      fill: style.fill,
      'fill-opacity': style.opacity ?? 0.2,
      stroke: 'none',
    },
    parent,
  );
}
