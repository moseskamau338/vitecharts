import {
  EASINGS,
  easeOutCubic,
  easeInOutCubic,
  linear,
  type EasingFn,
  type EasingName,
} from './easing.js';

export type AnimationPreset = 'apex' | 'material' | 'none';

/** Public animation option (boolean | preset name | detailed config). */
export interface AnimationOption {
  enabled?: boolean;
  preset?: AnimationPreset;
  /** Enter-animation duration in ms. */
  duration?: number;
  easing?: EasingName;
  /** Initial delay in ms. */
  delay?: number;
  /** Per-series stagger in ms. */
  stagger?: number;
  /** Animate data updates, not just the initial mount. */
  dynamic?: boolean;
}

export type AnimateOption = boolean | AnimationPreset | AnimationOption;

/** Fully-resolved animation settings used by chart types. */
export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: EasingFn;
  delay: number;
  stagger: number;
  dynamic: boolean;
  /** Duration used for update/streaming animations. */
  dynamicDuration: number;
}

type PresetBase = Omit<AnimationConfig, 'enabled'>;

const PRESETS: Record<AnimationPreset, PresetBase> = {
  // Tuned to feel like ApexCharts' defaults.
  apex: {
    duration: 800,
    easing: easeInOutCubic,
    delay: 0,
    stagger: 120,
    dynamic: true,
    dynamicDuration: 350,
  },
  material: {
    duration: 400,
    easing: easeOutCubic,
    delay: 0,
    stagger: 60,
    dynamic: true,
    dynamicDuration: 250,
  },
  none: {
    duration: 0,
    easing: linear,
    delay: 0,
    stagger: 0,
    dynamic: false,
    dynamicDuration: 0,
  },
};

export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function normalize(option: AnimateOption | undefined): AnimationOption {
  if (option == null || option === true) return {};
  if (option === false) return { enabled: false };
  if (typeof option === 'string') return { preset: option };
  return option;
}

/**
 * Resolve a user `animate` option into a concrete {@link AnimationConfig}.
 * Reduced-motion (or `preset: 'none'` / `enabled: false`) forces `enabled: false`,
 * which makes every choreography helper a no-op (the chart's final frame stands).
 */
export function resolveAnimation(
  option?: AnimateOption,
  reducedMotion: boolean = prefersReducedMotion(),
): AnimationConfig {
  const opt = normalize(option);
  const presetName = opt.preset ?? 'apex';
  const preset = PRESETS[presetName] ?? PRESETS.apex;
  const enabled = (opt.enabled ?? presetName !== 'none') && !reducedMotion;
  const easing = opt.easing ? (EASINGS[opt.easing] ?? preset.easing) : preset.easing;

  return {
    enabled,
    duration: opt.duration ?? preset.duration,
    easing,
    delay: opt.delay ?? preset.delay,
    stagger: opt.stagger ?? preset.stagger,
    dynamic: opt.dynamic ?? preset.dynamic,
    dynamicDuration: preset.dynamicDuration,
  };
}
