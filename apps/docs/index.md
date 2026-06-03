---
layout: home
hero:
  name: ViteCharts
  text: Animated charts, one core, any framework
  tagline: The feel of ApexCharts on the grammar of Observable Plot — tween/spring animation, tooltips, brushing, export, and thin React / Vue / Web-Component adapters. Apache-2.0.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Chart gallery
      link: /charts/line
    - theme: alt
      text: GitHub
      link: https://github.com/moseskamau338/vitecharts
features:
  - icon: ✨
    title: Apex-grade animation
    details: Line draw-on, bar grow, arc sweep, and marker pop powered by a tween + spring engine — with apex / material / none presets and reduced-motion support.
  - icon: 🧩
    title: One core, many adapters
    details: All logic lives in a framework-agnostic core. React, Vue, and a Web Component are thin wrappers; bring your own framework or none.
  - icon: 📊
    title: A full catalog
    details: Line, area, bar, scatter, combo, pie, donut, polar, gauge, radar, candlestick, boxplot, heatmap, funnel, and range — with tooltips, legend, zoom/pan, brushing, and sync.
  - icon: 📦
    title: Small & typed
    details: ESM-first, tree-shakeable, ~5 kB gzipped core with d3 externalized. Strict TypeScript types ship with every package.
  - icon: 🖼️
    title: Export anywhere
    details: One call to SVG (true vector), PNG, CSV, or JSON — or chart.download(format).
  - icon: ⚖️
    title: Apache-2.0
    details: Fully open, permissive license. Clean-room — no ApexCharts source is used.
---

<script setup>
const data = [
  { month: 'Jan', revenue: 44, users: 13 },
  { month: 'Feb', revenue: 55, users: 23 },
  { month: 'Mar', revenue: 57, users: 20 },
  { month: 'Apr', revenue: 56, users: 8 },
  { month: 'May', revenue: 61, users: 27 },
  { month: 'Jun', revenue: 58, users: 18 },
  { month: 'Jul', revenue: 63, users: 30 },
]
</script>

<div style="max-width: 960px; margin: 0 auto; padding: 0 24px;">

## A combo chart in a few lines

<ChartDemo :options="{
  type: 'bar',
  data,
  x: 'month',
  series: [
    { y: 'revenue', name: 'Revenue', type: 'bar' },
    { y: 'users', name: 'Users', type: 'line', curve: 'smooth' },
  ],
  animate: 'apex',
  legend: true,
  markers: true,
}" />

```ts
import { Chart } from '@vitecharts/core';

new Chart('#chart', {
  type: 'bar',
  data,
  x: 'month',
  series: [
    { y: 'revenue', name: 'Revenue', type: 'bar' },
    { y: 'users', name: 'Users', type: 'line', curve: 'smooth' },
  ],
  animate: 'apex',
  legend: true,
  markers: true,
});
```

</div>
