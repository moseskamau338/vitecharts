# Styling

<script setup>
const data = [
  { m: 'Jan', v: 30, w: 18 }, { m: 'Feb', v: 44, w: 24 }, { m: 'Mar', v: 35, w: 20 },
  { m: 'Apr', v: 58, w: 30 }, { m: 'May', v: 49, w: 26 }, { m: 'Jun', v: 70, w: 38 },
]
const gaps = [
  { m: 'Jan', v: 30 }, { m: 'Feb', v: 44 }, { m: 'Mar', v: null },
  { m: 'Apr', v: 58 }, { m: 'May', v: null }, { m: 'Jun', v: 70 },
]
const spark = Array.from({ length: 30 }, (_, i) => ({ t: i, v: 50 + Math.sin(i / 3) * 20 }))
</script>

## Gradient fills

Set `series.gradient` to fade an area or bar fill to transparent.

<ChartDemo :options="{
  type: 'area',
  data,
  x: 'm',
  series: [{ y: 'v', name: 'Revenue', curve: 'smooth', gradient: true }],
  animate: 'apex',
}" />

```ts
series: [{ y: 'v', gradient: true }];
```

## Dashed lines

<ChartDemo :options="{
  type: 'line',
  data,
  x: 'm',
  series: [
    { y: 'v', name: 'Actual', curve: 'smooth' },
    { y: 'w', name: 'Forecast', curve: 'smooth', dash: '6 4' },
  ],
  legend: true,
  animate: 'apex',
}" />

```ts
series: [{ y: 'w', dash: '6 4' }];
```

## Data labels

`dataLabels: true` prints each value (and counts up on updates).

<ChartDemo :options="{ type: 'bar', data, x: 'm', series: [{ y: 'v', name: 'Revenue' }], dataLabels: true, animate: 'apex' }" />

## Null gaps

An explicit `null` y value breaks the line into a gap (missing keys are skipped instead).

<ChartDemo :options="{ type: 'line', data: gaps, x: 'm', series: [{ y: 'v', curve: 'smooth' }], markers: true, animate: 'apex' }" />

## Sparklines

`sparkline: true` strips the axes, grid, padding, and tooltip for inline charts.

<ChartDemo :options="{ type: 'area', data: spark, x: 't', series: [{ y: 'v', curve: 'smooth', gradient: true }], sparkline: true, animate: 'apex' }" :height="80" />

```ts
new Chart('#el', { type: 'area', data, x: 't', series: [{ y: 'v' }], sparkline: true });
```
