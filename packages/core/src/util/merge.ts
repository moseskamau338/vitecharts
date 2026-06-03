import { isObject } from './guards.js';

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Recursively merge `patch` onto a copy of `base`. Plain objects are merged
 * deeply; arrays and primitives are replaced wholesale. Used by the spec
 * compiler to layer user options over theme/default objects.
 */
export function deepMerge<T>(base: T, patch?: DeepPartial<T>): T {
  if (!patch) return base;
  if (!isObject(base)) return (patch as unknown as T) ?? base;

  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key in patch) {
    const next = (patch as Record<string, unknown>)[key];
    if (next === undefined) continue;
    const prev = out[key];
    out[key] = isObject(prev) && isObject(next) ? deepMerge(prev, next) : next;
  }
  return out as T;
}
