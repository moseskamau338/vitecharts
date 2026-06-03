# Annotations

<script setup>
const data = [
  { m: 'Jan', v: 30 }, { m: 'Feb', v: 40 }, { m: 'Mar', v: 35 }, { m: 'Apr', v: 55 },
  { m: 'May', v: 49 }, { m: 'Jun', v: 70 }, { m: 'Jul', v: 62 }, { m: 'Aug', v: 78 },
]
</script>

Draw reference lines, regions, and points over the plot with the `annotations` array.

<ChartDemo :options="{
  type: 'line',
  data,
  x: 'm',
  series: [{ y: 'v', name: 'Sales', curve: 'smooth' }],
  markers: true,
  animate: 'apex',
  annotations: [
    { type: 'yLine', y: 60, label: 'Target', color: '#16a34a' },
    { type: 'region', y: 0, y2: 40, color: '#ef4444' },
    { type: 'point', x: 'Jun', y: 70, label: 'Peak' },
  ],
}" />

```ts
new Chart('#el', {
  annotations: [
    { type: 'yLine', y: 60, label: 'Target', color: '#16a34a' },
    { type: 'xLine', x: 'Jun', label: 'Launch' },
    { type: 'region', y: 0, y2: 40, color: '#ef4444' },
    { type: 'point', x: 'Jun', y: 70, label: 'Peak' },
  ],
});
```

| Type     | Fields                             |
| -------- | ---------------------------------- |
| `yLine`  | `y`, `label?`, `color?`            |
| `xLine`  | `x`, `label?`, `color?`            |
| `region` | `x`/`x2` and/or `y`/`y2`, `color?` |
| `point`  | `x`, `y`, `label?`, `color?`       |
