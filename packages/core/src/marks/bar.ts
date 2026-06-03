import type { NodeHandle, Renderer } from '../renderer/types.js';
import type { RectStyle } from './types.js';

export interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function drawBar(
  renderer: Renderer,
  rect: BarRect,
  style: RectStyle,
  parent?: NodeHandle,
): NodeHandle {
  const radius = style.radius ?? 0;
  return renderer.rect(
    {
      x: rect.x,
      y: rect.y,
      width: Math.max(0, rect.width),
      height: Math.max(0, rect.height),
      rx: radius,
      ry: radius,
      fill: style.fill,
      ...(style.opacity != null ? { 'fill-opacity': style.opacity } : {}),
    },
    parent,
  );
}
