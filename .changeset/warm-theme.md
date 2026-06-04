---
'@vitecharts/core': minor
---

Warm editorial theming + CSS-variable theming.

- New **warm, light-first default theme** (terracotta-led palette, warm neutrals)
  with a warm dark theme. Light is the default; pass `theme: 'dark'` for dark.
- Tooltips are now inverted for contrast and inherit theme tokens; chart labels
  use a monospace stack with tabular figures.
- New **`theme: 'css'`** reads `--vc-grid` / `--vc-axis` / `--vc-ink-soft` /
  `--vc-surface` / `--vc-tooltip-bg/fg` / `--vc-font` and palette `--c1…--c12`
  from the container, so a host stylesheet can drive chart colors and charts
  follow a dark-mode class instantly. Exposed as `themeFromCss`.

Fully customizable — `theme` still accepts `'light'`/`'dark'`/a partial object,
and `colors` overrides the palette.
