# @vitecharts/compat-apex

## 0.1.0

### Minor Changes

- 8413459: Performance, accessibility, and ApexCharts compatibility.
  - core: LTTB downsampling automatically thins line series longer than ~2000
    points (preserving shape); exported as `lttb`.
  - core: accessibility — `role="img"`, `aria-label`, and a `<title>` on the SVG,
    with a new `ariaLabel` option (auto-generated fallback).
  - new package `@vitecharts/compat-apex` with `fromApex(apexOptions)` to translate
    an ApexCharts config into ViteCharts options (best-effort).

### Patch Changes

- Updated dependencies [e6cd903]
- Updated dependencies [2dbbdc8]
- Updated dependencies [e932cd1]
- Updated dependencies [693f099]
- Updated dependencies [b64de0e]
- Updated dependencies [05adc49]
- Updated dependencies [b40b1eb]
- Updated dependencies [ffd8565]
- Updated dependencies [8413459]
- Updated dependencies [9a73461]
- Updated dependencies [58f8d72]
- Updated dependencies [70a7582]
- Updated dependencies [18652d5]
- Updated dependencies [b828afb]
- Updated dependencies [83e6edc]
- Updated dependencies [5e27867]
- Updated dependencies [02fbf47]
- Updated dependencies [751bbd4]
  - @vitecharts/core@0.1.0
