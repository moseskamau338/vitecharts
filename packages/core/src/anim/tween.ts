import { linear, type EasingFn } from './easing.js';
import { scheduler } from './scheduler.js';

export interface TweenOptions {
  /** Duration in milliseconds. `<= 0` completes synchronously. */
  duration: number;
  easing?: EasingFn;
  /** Delay before the tween starts, in milliseconds. */
  delay?: number;
  /** Called each frame with eased and raw progress in [0, 1]. */
  onUpdate: (eased: number, raw: number) => void;
  onComplete?: () => void;
}

export interface TweenHandle {
  /** Stop without jumping to the final value. */
  cancel(): void;
  /** Jump to the final value and complete now. */
  finish(): void;
  readonly done: boolean;
}

/**
 * Tween `onUpdate` from 0→1 over `duration`, driven by the shared scheduler.
 * Honors a `delay`, applies `easing`, and runs synchronously to completion when
 * `duration <= 0` (used for reduced-motion / disabled animation).
 */
export function tween(options: TweenOptions): TweenHandle {
  const easing = options.easing ?? linear;
  const delay = options.delay ?? 0;

  if (options.duration <= 0) {
    options.onUpdate(1, 1);
    options.onComplete?.();
    return { cancel() {}, finish() {}, done: true };
  }

  let start: number | null = null;
  let finished = false;
  let cancelled = false;

  const task = (now: number): void => {
    if (finished || cancelled) return;
    if (start == null) start = now;
    const elapsed = now - start - delay;
    if (elapsed < 0) return;
    const raw = elapsed / options.duration;
    if (raw >= 1) {
      finish();
      return;
    }
    options.onUpdate(easing(raw), raw);
  };

  function finish(): void {
    if (finished || cancelled) return;
    finished = true;
    scheduler.remove(task);
    options.onUpdate(easing(1), 1);
    options.onComplete?.();
  }

  function cancel(): void {
    if (finished || cancelled) return;
    cancelled = true;
    scheduler.remove(task);
  }

  scheduler.add(task);

  return {
    cancel,
    finish,
    get done() {
      return finished || cancelled;
    },
  };
}
