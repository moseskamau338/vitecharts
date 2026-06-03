import type { ChartType } from '../types.js';
import { cartesianChart } from './cartesian.js';

/**
 * Chart-type registry. Each phase registers more types here; the {@link Chart}
 * looks a type up by name so types stay tree-shakeable behind lazy imports later.
 *
 * Every cartesian type shares one renderer — per-series `type` enables combos.
 */
export const registry: Record<string, ChartType> = {
  line: cartesianChart,
  area: cartesianChart,
  bar: cartesianChart,
  scatter: cartesianChart,
};
