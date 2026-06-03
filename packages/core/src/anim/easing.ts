/** Easing functions over normalized time `t` in [0, 1]. */

export type EasingFn = (t: number) => number;

export const linear: EasingFn = (t) => t;

export const easeInQuad: EasingFn = (t) => t * t;
export const easeOutQuad: EasingFn = (t) => t * (2 - t);
export const easeInOutQuad: EasingFn = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export const easeInCubic: EasingFn = (t) => t * t * t;
export const easeOutCubic: EasingFn = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutQuart: EasingFn = (t) => 1 - Math.pow(1 - t, 4);

const BACK = 1.70158;
export const easeOutBack: EasingFn = (t) => {
  const c3 = BACK + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + BACK * Math.pow(t - 1, 2);
};

export const easeOutElastic: EasingFn = (t) => {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const EASINGS = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeOutQuart,
  easeOutBack,
  easeOutElastic,
} satisfies Record<string, EasingFn>;

export type EasingName = keyof typeof EASINGS;
