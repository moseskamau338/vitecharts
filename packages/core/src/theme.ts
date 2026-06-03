import { DEFAULT_COLORS } from './palette.js';
import { deepMerge } from './util/merge.js';

export interface ResolvedTheme {
  /** Categorical series palette. */
  colors: string[];
  /** Plot background (used by export; not painted by default). */
  background: string;
  /** Axis line / baseline color. */
  axisColor: string;
  /** Gridline color. */
  gridColor: string;
  /** Tick label color. */
  labelColor: string;
  /** Default font stack for text. */
  fontFamily: string;
}

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const lightTheme: ResolvedTheme = {
  colors: DEFAULT_COLORS,
  background: '#ffffff',
  axisColor: '#e3e6ea',
  gridColor: '#f1f3f5',
  labelColor: '#6b7280',
  fontFamily: FONT,
};

export const darkTheme: ResolvedTheme = {
  colors: DEFAULT_COLORS,
  background: '#1a1b26',
  axisColor: '#33384a',
  gridColor: '#262a38',
  labelColor: '#9aa4b2',
  fontFamily: FONT,
};

const BUILT_IN: Record<string, ResolvedTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

export type ThemeName = keyof typeof BUILT_IN;
export type ThemeOption = ThemeName | Partial<ResolvedTheme>;

/**
 * Resolve a theme option (a built-in name or a partial override) into a full
 * theme. `colorsOverride` (from `options.colors`) wins over the theme palette.
 */
export function resolveTheme(option?: ThemeOption, colorsOverride?: string[]): ResolvedTheme {
  const base =
    typeof option === 'string' ? (BUILT_IN[option] ?? lightTheme) : deepMerge(lightTheme, option);
  return colorsOverride ? { ...base, colors: colorsOverride } : base;
}
