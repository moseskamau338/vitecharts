# Combo / Mixed

<script setup>
const data = [
  { m: 'Jan', revenue: 44, target: 40, growth: 13 },
  { m: 'Feb', revenue: 55, target: 45, growth: 23 },
  { m: 'Mar', revenue: 57, target: 50, growth: 20 },
  { m: 'Apr', revenue: 56, target: 55, growth: 8 },
  { m: 'May', revenue: 61, target: 58, growth: 27 },
  { m: 'Jun', revenue: 68, target: 60, growth: 18 },
]
</script>

Set a per-series `type` to mix marks in one chart. When any series is a `bar`, the x axis
becomes categorical and the other series align to the band centers.

<ChartDemo :options="{
  type: 'bar',
  data,
  x: 'm',
  series: [
    { y: 'revenue', name: 'Revenue', type: 'bar' },
    { y: 'target', name: 'Target', type: 'line', curve: 'smooth' },
    { y: 'growth', name: 'Growth', type: 'area', curve: 'smooth' },
  ],
  legend: true,
  markers: true,
  animate: 'apex',
}" />

```ts
new Chart('#el', {
  type: 'bar',
  data,
  x: 'm',
  series: [
    { y: 'revenue', name: 'Revenue', type: 'bar' },
    { y: 'target', name: 'Target', type: 'line', curve: 'smooth' },
    { y: 'growth', name: 'Growth', type: 'area' },
  ],
  legend: true,
});
```

The top-level `type` is the default for any series that doesn't set its own.
