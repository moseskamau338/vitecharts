import { arc as d3arc } from 'd3-shape';
import type { NodeHandle, Renderer } from '../renderer/types.js';
import type { ArcStyle } from './types.js';

export interface ArcConfig {
  innerRadius?: number;
  outerRadius: number;
  /** Start angle in radians (0 = 12 o'clock, clockwise). */
  startAngle: number;
  endAngle: number;
  cornerRadius?: number;
  padAngle?: number;
}

/**
 * Build an arc path centered at the origin. The caller positions it by drawing
 * into a translated group (e.g. the pie/donut center).
 */
export function arcPath(cfg: ArcConfig): string {
  // Accessors are set as constants, so the datum is ignored — we pass `cfg`
  // only to satisfy the generator's required argument.
  return (
    d3arc<ArcConfig>()
      .innerRadius(cfg.innerRadius ?? 0)
      .outerRadius(cfg.outerRadius)
      .startAngle(cfg.startAngle)
      .endAngle(cfg.endAngle)
      .cornerRadius(cfg.cornerRadius ?? 0)
      .padAngle(cfg.padAngle ?? 0)(cfg) ?? ''
  );
}

export function drawArc(
  renderer: Renderer,
  cfg: ArcConfig,
  style: ArcStyle,
  parent?: NodeHandle,
): NodeHandle {
  return renderer.path(
    {
      d: arcPath(cfg),
      fill: style.fill,
      ...(style.stroke ? { stroke: style.stroke, 'stroke-width': style.strokeWidth ?? 1 } : {}),
    },
    parent,
  );
}
