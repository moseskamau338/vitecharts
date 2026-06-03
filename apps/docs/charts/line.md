# Line & Spline

<script setup>
const single = [
  { x: 'Mon', v: 12 }, { x: 'Tue', v: 18 }, { x: 'Wed', v: 9 },
  { x: 'Thu', v: 22 }, { x: 'Fri', v: 28 }, { x: 'Sat', v: 19 }, { x: 'Sun', v: 31 },
]
const multi = [
  { m: 'Jan', north: 44, south: 30 }, { m: 'Feb', north: 55, south: 42 },
  { m: 'Mar', north: 41, south: 50 }, { m: 'Apr', north: 67, south: 48 },
  { m: 'May', north: 22, south: 61 }, { m: 'Jun', north: 43, south: 39 },
]
const series = Array.from({ length: 40 }, (_, i) => ({ t: i, v: 50 + Math.sin(i / 4) * 22 }))
</script>

A simple line chart needs `type: 'line'`, your data, the `x` key, and one `series`.

<ChartDemo :options="{ type: 'line', data: single, x: 'x', series: [{ y: 'v', name: 'Visits' }], markers: true, animate: 'apex' }" />

```ts
new Chart('#el', {
  type: 'line',
  data: single,
  x: 'x',
  series: [{ y: 'v', name: 'Visits' }],
  markers: true,
});
```

## Spline (smooth curve)

Set `curve: 'smooth'` on a series. Curves available: `linear`, `smooth`, `step`, `basis`.

<ChartDemo :options="{ type: 'line', data: series, x: 't', series: [{ y: 'v', name: 'Signal', curve: 'smooth' }], animate: 'apex' }" />

```ts
series: [{ y: 'v', curve: 'smooth' }];
```

## Multiple series

Add more entries to `series`; colors come from the theme palette and the legend toggles them.

<ChartDemo :options="{
  type: 'line',
  data: multi,
  x: 'm',
  series: [
    { y: 'north', name: 'North', curve: 'smooth' },
    { y: 'south', name: 'South', curve: 'smooth' },
  ],
  markers: true,
  legend: true,
  animate: 'apex',
}" />

## Step line

<ChartDemo :options="{ type: 'line', data: single, x: 'x', series: [{ y: 'v', curve: 'step' }], animate: 'apex' }" />

## Options

| Option           | Description                                       |
| ---------------- | ------------------------------------------------- |
| `series[].curve` | `linear` · `smooth` · `step` · `basis`            |
| `markers`        | Draw point markers on each series                 |
| `axes.y.format`  | Format y tick labels, e.g. `(v) => '$' + v`       |
| `axes.x.type`    | Force a scale type (`time`, `linear`, `point`, …) |
