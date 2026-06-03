import type { ChartType } from '../types.js';
import { lineChart } from './line.js';

/**
 * Chart-type registry. Each phase registers more types here; the {@link Chart}
 * looks a type up by name so types stay tree-shakeable behind lazy imports later.
 */
export const registry: Record<string, ChartType> = {
  line: lineChart,
};
