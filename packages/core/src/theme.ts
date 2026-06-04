import { DEFAULT_COLORS } from './palette.js';
import { deepMerge } from './util/merge.js';

export interface ResolvedTheme {
  /** Categorical series palette. */
  colors: string[];
  /** Plot/surface background (used by tooltip + export; not painted by default). */
  background: string;
  /** Axis line / baseline color. */
  axisColor: string;
  /** Gridline color. */
  gridColor: string;
  /** Tick / data label color. */
  labelColor: string;
  /** Default font stack for chart text (mono = the "technical layer"). */
  fontFamily: string;
  /** Tooltip background (inverted by default for contrast). */
  tooltipBg: string;
  /** Tooltip text color. */
  tooltipColor: string;
}

// The technical layer (axis ticks, data labels, tooltips) is monospace with
// tabular figures — crisp and aligned. Editorial prose lives in the page, not here.
const MONO = 'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace';

/** Warm editorial light theme — the default. */
export const lightTheme: ResolvedTheme = {
  colors: DEFAULT_COLORS,
  background: '#ffffff',
  axisColor: '#D8CBB8',
  gridColor: '#ECE2D3',
  labelColor: '#8B8178',
  fontFamily: MONO,
  tooltipBg: '#2A2420',
  tooltipColor: '#FBF7F1',
};

/** Warm dark theme. */
export const darkTheme: ResolvedTheme = {
  colors: ['#E27A53', '#E6B05E', '#82B3A2', '#BE7C97', '#7C9CC4', '#E0C45A', '#A4B36F', '#CF9881'],
  background: '#241E1A',
  axisColor: '#3D3127',
  gridColor: '#31281F',
  labelColor: '#8E8175',
  fontFamily: MONO,
  tooltipBg: '#F3EBE0',
  tooltipColor: '#1B1714',
};

const BUILT_IN: Record<string, ResolvedTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

export type ThemeName = keyof typeof BUILT_IN;
/** `'css'` resolves colors from `--vc-*` CSS variables on the container. */
export type ThemeOption = ThemeName | 'css' | Partial<ResolvedTheme>;

/**
 * Resolve a theme option (a built-in name or a partial override) into a full
 * theme. `colorsOverride` (from `options.colors`) wins over the theme palette.
 * The `'css'` option is handled by the Chart (it needs the container element).
 */
export function resolveTheme(option?: ThemeOption, colorsOverride?: string[]): ResolvedTheme {
  const base =
    typeof option === 'string' ? (BUILT_IN[option] ?? lightTheme) : deepMerge(lightTheme, option);
  return colorsOverride ? { ...base, colors: colorsOverride } : base;
}

/**
 * Build a theme by reading CSS custom properties from `el` (cascading from
 * `:root`), falling back to the light theme for any unset variable. Lets a host
 * stylesheet drive chart colors — flip a `.dark` class and charts follow.
 *
 * Reads: `--vc-ink-soft` (labels), `--vc-grid`, `--vc-axis`, `--vc-surface`,
 * `--vc-tooltip-bg`, `--vc-tooltip-fg`, `--vc-font`, and palette `--c1`…`--c8`.
 */
export function themeFromCss(el: Element): ResolvedTheme {
  const cs = getComputedStyle(el);
  const v = (name: string): string | undefined => {
    const val = cs.getPropertyValue(name).trim();
    return val.length > 0 ? val : undefined;
  };
  const palette: string[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = v(`--c${i}`);
    if (c) palette.push(c);
  }
  return {
    colors: palette.length > 0 ? palette : lightTheme.colors,
    background: v('--vc-surface') ?? lightTheme.background,
    axisColor: v('--vc-axis') ?? lightTheme.axisColor,
    gridColor: v('--vc-grid') ?? lightTheme.gridColor,
    labelColor: v('--vc-ink-soft') ?? lightTheme.labelColor,
    fontFamily: v('--vc-font') ?? cs.fontFamily ?? lightTheme.fontFamily,
    tooltipBg: v('--vc-tooltip-bg') ?? lightTheme.tooltipBg,
    tooltipColor: v('--vc-tooltip-fg') ?? lightTheme.tooltipColor,
  };
}
