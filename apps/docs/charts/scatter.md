# Scatter & Bubble

<script setup>
const scatter = Array.from({ length: 40 }, (_, i) => ({
  x: Math.round(Math.random() * 100),
  y: Math.round(Math.random() * 100),
}))
const bubble = Array.from({ length: 24 }, () => ({
  x: Math.round(Math.random() * 100),
  y: Math.round(Math.random() * 100),
  size: Math.round(Math.random() * 100) + 10,
}))
const groups = [
  ...Array.from({ length: 20 }, () => ({ x: Math.random() * 50, a: Math.random() * 50 })),
  ...Array.from({ length: 20 }, () => ({ x: 40 + Math.random() * 50, b: 40 + Math.random() * 50 })),
]
</script>

Plot raw points with `type: 'scatter'`. The x scale is inferred (numbers → linear).

<ChartDemo :options="{ type: 'scatter', data: scatter, x: 'x', series: [{ y: 'y', name: 'Samples' }], animate: 'apex' }" />

## Multiple groups

<ChartDemo :options="{
  type: 'scatter',
  data: groups,
  x: 'x',
  series: [
    { y: 'a', name: 'Group A' },
    { y: 'b', name: 'Group B' },
  ],
  legend: true,
  animate: 'apex',
}" />

## Bubble

Add a `size` key to a series and the radius encodes that value (a √ scale keeps areas fair).

<ChartDemo :options="{ type: 'scatter', data: bubble, x: 'x', series: [{ y: 'y', name: 'Items', size: 'size' }], animate: 'apex' }" />

```ts
new Chart('#el', {
  type: 'scatter',
  data: bubble,
  x: 'x',
  series: [{ y: 'y', size: 'size' }], // bubble
});
```
