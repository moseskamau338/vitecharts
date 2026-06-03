# Getting started

ViteCharts is an animated, framework-agnostic charting library. The core renders to SVG and
exposes a small imperative API; framework adapters wrap it for React, Vue, and Web Components.

## Install

```bash
npm install @vitecharts/core
# pnpm add @vitecharts/core · yarn add @vitecharts/core
```

## Your first chart

Give it a container, a dataset, the `x` key, and one or more `series`:

<script setup>
const sales = [
  { month: 'Jan', sales: 30, profit: 12 },
  { month: 'Feb', sales: 40, profit: 18 },
  { month: 'Mar', sales: 35, profit: 15 },
  { month: 'Apr', sales: 55, profit: 28 },
  { month: 'May', sales: 49, profit: 22 },
  { month: 'Jun', sales: 70, profit: 41 },
]
</script>

<ChartDemo :options="{
  type: 'line',
  data: sales,
  x: 'month',
  series: [
    { y: 'sales', name: 'Sales', curve: 'smooth' },
    { y: 'profit', name: 'Profit' },
  ],
  markers: true,
  animate: 'apex',
  axes: { y: { format: (v) => '$' + v + 'k' } },
}" />

```ts
import { Chart } from '@vitecharts/core';

const chart = new Chart('#chart', {
  type: 'line',
  data: sales,
  x: 'month',
  series: [
    { y: 'sales', name: 'Sales', curve: 'smooth' },
    { y: 'profit', name: 'Profit' },
  ],
  markers: true,
  animate: 'apex',
  axes: { y: { format: (v) => `$${v}k` } },
});
```

## The imperative API

Every method is chainable and re-renders reactively:

```ts
chart.appendData({ month: 'Jul', sales: 62, profit: 35 }); // animated streaming
chart.updateSeries([{ y: 'sales' }]); // replace series
chart.setData(nextDataset); // replace data
chart.update({ theme: 'dark' }); // patch any option
chart.on('markerClick', ({ point }) => console.log(point));
chart.destroy(); // tear down
```

## In a framework

```tsx
// React — @vitecharts/react
import { Chart } from '@vitecharts/react';

<Chart type="line" data={sales} x="month" series={[{ y: 'sales' }]} animate="apex" />;
```

See [Adapters](/adapters) for Vue and the Web Component. Next: the [Concepts](/guide/concepts)
behind the engine, or jump into the [chart gallery](/charts/line).
