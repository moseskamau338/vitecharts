import type { NodeHandle, Renderer } from '../renderer/types.js';
import type { PixelPoint, PointStyle } from './types.js';

export function drawPoints(
  renderer: Renderer,
  points: PixelPoint[],
  style: PointStyle,
  parent?: NodeHandle,
): NodeHandle {
  const group = renderer.group({ class: 'vitecharts-markers' }, parent);
  for (const p of points) {
    renderer.circle(
      {
        cx: p.x,
        cy: p.y,
        r: style.radius ?? 3,
        fill: style.fill,
        stroke: style.stroke ?? '#ffffff',
        'stroke-width': style.strokeWidth ?? 1,
      },
      group,
    );
  }
  return group;
}
