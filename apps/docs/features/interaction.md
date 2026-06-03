# Interaction

<script setup>
const data = [
  { m: 'Jan', sales: 44, cost: 13 }, { m: 'Feb', sales: 55, cost: 23 },
  { m: 'Mar', sales: 41, cost: 20 }, { m: 'Apr', sales: 67, cost: 30 },
  { m: 'May', sales: 22, cost: 18 }, { m: 'Jun', sales: 43, cost: 25 },
]
</script>

Hover the chart below: a shared **tooltip** follows the nearest x and a **crosshair** tracks
it. Click a **legend** item to toggle that series.

<ChartDemo :options="{
  type: 'line',
  data,
  x: 'm',
  series: [
    { y: 'sales', name: 'Sales', curve: 'smooth' },
    { y: 'cost', name: 'Cost', curve: 'smooth' },
  ],
  markers: true,
  legend: true,
  animate: 'apex',
}" />

Tooltip and crosshair are on by default. Disable or configure them:

```ts
new Chart('#el', {
  tooltip: false, // turn off
  crosshair: false,
  legend: { position: 'top' }, // 'top' | 'bottom' | 'left' | 'right'
});
```

## Custom tooltip

Provide a `render` function returning an HTML string for the hovered group.

<ChartDemo :options="{
  type: 'bar',
  data,
  x: 'm',
  series: [{ y: 'sales', name: 'Sales' }],
  tooltip: { render: (g) => '<strong>' + g.xRaw + '</strong>: ' + g.points[0].value + ' units' },
  animate: 'apex',
}" />

```ts
new Chart('#el', {
  tooltip: {
    render: (group) => `<b>${group.xRaw}</b>: ${group.points[0].value} units`,
  },
});
```

## Events

`chart.on(...)` returns an unsubscribe function. Available events:

```ts
chart.on('pointerMove', ({ group }) => {});
chart.on('pointerLeave', () => {});
chart.on('markerClick', ({ point }) => {});
chart.on('legendClick', ({ seriesIndex, name, hidden }) => {});
chart.on('brushSelection', ({ x0, x1 }) => {});
```
