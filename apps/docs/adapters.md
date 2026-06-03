# Framework adapters

Every adapter is a thin wrapper that drives the same core `Chart` — create on mount, apply
option changes, tear down on unmount. The full options object is identical across all of them.

## React

```bash
npm install @vitecharts/react
```

```tsx
import { Chart } from '@vitecharts/react';

export function Sales({ data }) {
  return (
    <Chart
      type="bar"
      data={data}
      x="month"
      series={[{ y: 'units', name: 'Units' }]}
      animate="apex"
      legend
      style={{ height: 360 }}
    />
  );
}
```

Grab the imperative instance with a ref:

```tsx
import { useRef } from 'react';
import { Chart, type ChartHandle } from '@vitecharts/react';

const ref = useRef<ChartHandle>(null);
// ref.current?.download('png')
<Chart ref={ref} type="line" data={data} x="m" series={[{ y: 'v' }]} />;
```

## Vue 3

```bash
npm install @vitecharts/vue
```

```vue
<script setup>
import { ViteChart } from '@vitecharts/vue';
const options = { type: 'line', data, x: 'm', series: [{ y: 'v' }], animate: 'apex' };
</script>

<template>
  <ViteChart :options="options" />
</template>
```

Reactive: mutate `options` and the chart updates in place.

## Web Component

```bash
npm install @vitecharts/wc
```

```html
<vitecharts-chart id="c" style="display:block; height:360px"></vitecharts-chart>
<script type="module">
  import '@vitecharts/wc';
  document.getElementById('c').options = {
    type: 'donut',
    data,
    x: 'label',
    series: [{ y: 'value' }],
  };
</script>
```

Works in any framework or none. Set the `.options` property to (re)render.

## Vanilla

```ts
import { Chart } from '@vitecharts/core';
new Chart('#el', { type: 'line', data, x: 'm', series: [{ y: 'v' }] });
```

> Svelte, Angular, and Solid adapters follow the same thin-wrapper shape and are coming next.
