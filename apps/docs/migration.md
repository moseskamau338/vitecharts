# Migrating from ApexCharts

`@vitecharts/compat-apex` translates an ApexCharts options object into ViteCharts options, so
you can try ViteCharts against an existing config with minimal changes.

```bash
npm install @vitecharts/compat-apex
```

```ts
import { Chart } from '@vitecharts/core';
import { fromApex } from '@vitecharts/compat-apex';

const apexOptions = {
  chart: { type: 'bar' },
  series: [
    { name: 'Sales', data: [30, 40, 35, 50] },
    { name: 'Cost', data: [12, 18, 15, 22] },
  ],
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
  theme: { mode: 'dark' },
};

new Chart('#el', fromApex(apexOptions));
```

## Coverage

This is a **best-effort** shim, not a guarantee of identical output. Currently mapped:

| ApexCharts                                                                      | → ViteCharts                  |
| ------------------------------------------------------------------------------- | ----------------------------- |
| `chart.type` (line/area/bar/column/scatter/pie/donut/radialBar/radar/polarArea) | `type`                        |
| Cartesian `series` + `xaxis.categories`                                         | row-based `data` + `series`   |
| `[x, y]` / `{ x, y }` point data                                                | inferred `x` + `y` keys       |
| Radial `series: number[]` + `labels`                                            | `data` rows (`label`/`value`) |
| `colors`                                                                        | `colors`                      |
| `theme.mode: 'dark'`                                                            | `theme: 'dark'`               |
| `stroke.curve` (smooth/stepline)                                                | series `curve`                |
| `title.text`                                                                    | `ariaLabel`                   |
| `legend.show` / `legend.position`                                               | `legend`                      |

Unsupported keys are ignored. For anything beyond the table, translate by hand — the native
[options](/api) are typed and discoverable.
