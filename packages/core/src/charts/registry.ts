import type { ChartType } from '../types.js';

/**
 * Chart-type registry. Starts empty — chart types register into it. The main
 * `@vitecharts/core` entry registers every built-in type on import (zero-config).
 * The tree-shakeable `@vitecharts/core/lean` entry registers nothing, so you
 * pull in only the chart families you `registerCharts(...)`.
 */
export const registry: Record<string, ChartType> = {};

/** A bundle of chart-type names mapped to their renderer (a registrable group). */
export interface ChartPlugin {
  readonly types: Readonly<Record<string, ChartType>>;
}

/** Register a single chart type under `name`. */
export function registerChart(name: string, chart: ChartType): void {
  registry[name] = chart;
}

/** Register one or more chart-type plugins (e.g. `registerCharts(cartesian, radial)`). */
export function registerCharts(...plugins: ChartPlugin[]): void {
  for (const plugin of plugins) {
    for (const name in plugin.types) registry[name] = plugin.types[name]!;
  }
}
