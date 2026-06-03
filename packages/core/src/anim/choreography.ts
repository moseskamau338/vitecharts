import { arcPath, type ArcConfig } from '../marks/arc.js';
import type { NodeHandle } from '../renderer/types.js';
import type { PixelPoint } from '../marks/types.js';
import type { AnimationConfig } from './presets.js';
import { tween, type TweenHandle } from './tween.js';

/**
 * Enter/update choreography per mark, expressed entirely through
 * `NodeHandle.set()` so it works on any renderer backend. Each helper draws the
 * node into its *initial* state and tweens it to the final state the chart
 * already rendered. When `config.enabled` is false they return `null` and leave
 * the final frame untouched.
 */

interface DelayOpt {
  delay?: number;
}

/** Approximate the on-screen length of a polyline (for stroke draw-on). */
export function polylineLength(points: PixelPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    total += Math.hypot(b.x - a.x, b.y - a.y);
  }
  // Small margin so curved paths are fully hidden at offset = length.
  return total * 1.08;
}

/** Line "draw-on": reveal the stroke from start to end. */
export function animateDrawOn(
  node: NodeHandle,
  lengthPx: number,
  config: AnimationConfig,
  opts: DelayOpt = {},
): TweenHandle | null {
  if (!config.enabled || lengthPx <= 0) return null;
  node.set({ 'stroke-dasharray': lengthPx, 'stroke-dashoffset': lengthPx });
  return tween({
    duration: config.duration,
    easing: config.easing,
    delay: opts.delay ?? config.delay,
    onUpdate: (eased) => node.set({ 'stroke-dashoffset': lengthPx * (1 - eased) }),
    onComplete: () => node.set({ 'stroke-dasharray': 'none', 'stroke-dashoffset': 0 }),
  });
}

/** Generic single-attribute number tween (e.g. marker radius pop). */
export function animateAttr(
  node: NodeHandle,
  attr: string,
  from: number,
  to: number,
  config: AnimationConfig,
  opts: DelayOpt = {},
): TweenHandle | null {
  if (!config.enabled) return null;
  node.set({ [attr]: from });
  return tween({
    duration: config.duration,
    easing: config.easing,
    delay: opts.delay ?? config.delay,
    onUpdate: (eased) => node.set({ [attr]: from + (to - from) * eased }),
    onComplete: () => node.set({ [attr]: to }),
  });
}

/** Fade a node in via opacity (used for dynamic/update animations). */
export function animateFadeIn(
  node: NodeHandle,
  config: AnimationConfig,
  opts: DelayOpt = {},
): TweenHandle | null {
  if (!config.enabled) return null;
  const duration = config.dynamicDuration || config.duration;
  node.set({ opacity: 0 });
  return tween({
    duration,
    easing: config.easing,
    delay: opts.delay ?? 0,
    onUpdate: (eased) => node.set({ opacity: eased }),
    onComplete: () => node.set({ opacity: 1 }),
  });
}

/** Bar "grow" from a baseline. */
export function animateBarGrow(
  node: NodeHandle,
  finalY: number,
  finalHeight: number,
  baselineY: number,
  config: AnimationConfig,
  opts: DelayOpt = {},
): TweenHandle | null {
  if (!config.enabled) return null;
  node.set({ y: baselineY, height: 0 });
  return tween({
    duration: config.duration,
    easing: config.easing,
    delay: opts.delay ?? config.delay,
    onUpdate: (eased) =>
      node.set({ y: baselineY + (finalY - baselineY) * eased, height: finalHeight * eased }),
    onComplete: () => node.set({ y: finalY, height: finalHeight }),
  });
}

/** Morph a rect between two `[x, y, width, height]` geometries (bar-race). */
export function animateRectMorph(
  node: NodeHandle,
  from: number[],
  to: number[],
  config: AnimationConfig,
): TweenHandle | null {
  if (!config.enabled || from.length < 4) return null;
  const [fx, fy, fw, fh] = from as [number, number, number, number];
  const [tx, ty, tw, th] = to as [number, number, number, number];
  node.set({ x: fx, y: fy, width: fw, height: fh });
  return tween({
    duration: config.dynamicDuration || config.duration,
    easing: config.easing,
    onUpdate: (e) =>
      node.set({
        x: fx + (tx - fx) * e,
        y: fy + (ty - fy) * e,
        width: fw + (tw - fw) * e,
        height: fh + (th - fh) * e,
      }),
    onComplete: () => node.set({ x: tx, y: ty, width: tw, height: th }),
  });
}

/** Count a text node's number up/down between two values (value count-up). */
export function animateNumber(
  node: NodeHandle,
  from: number,
  to: number,
  config: AnimationConfig,
  format: (v: number) => string = (v) => String(Math.round(v)),
): TweenHandle | null {
  if (!config.enabled) {
    node.text(format(to));
    return null;
  }
  node.text(format(from)); // start from the old value
  return tween({
    duration: config.dynamicDuration || config.duration,
    easing: config.easing,
    onUpdate: (e) => node.text(format(from + (to - from) * e)),
    onComplete: () => node.text(format(to)),
  });
}

/** Arc/pie "sweep" by growing the end angle. */
export function animateArcSweep(
  node: NodeHandle,
  arc: ArcConfig,
  config: AnimationConfig,
  opts: DelayOpt = {},
): TweenHandle | null {
  if (!config.enabled) return null;
  const span = arc.endAngle - arc.startAngle;
  node.set({ d: arcPath({ ...arc, endAngle: arc.startAngle }) });
  return tween({
    duration: config.duration,
    easing: config.easing,
    delay: opts.delay ?? config.delay,
    onUpdate: (eased) =>
      node.set({ d: arcPath({ ...arc, endAngle: arc.startAngle + span * eased }) }),
    onComplete: () => node.set({ d: arcPath(arc) }),
  });
}
