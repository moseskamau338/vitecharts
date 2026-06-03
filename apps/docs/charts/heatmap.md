# Heatmap

<script setup>
const hours = ['12a','3a','6a','9a','12p','3p','6p','9p']
function rowFor(label) {
  const r = { h: label }
  for (const d of ['Mon','Tue','Wed','Thu','Fri']) r[d] = Math.round(Math.random()*20)
  return r
}
const data = hours.map(rowFor)
</script>

In a heatmap, the **columns** come from the `x` values (one per data row) and the **rows**
from the series. Each cell's value is `row[series.y]`, colored by a continuous visualMap
scale shown beneath the grid.

<ChartDemo :options="{
  type: 'heatmap',
  data,
  x: 'h',
  series: [
    { y: 'Mon', name: 'Mon' },
    { y: 'Tue', name: 'Tue' },
    { y: 'Wed', name: 'Wed' },
    { y: 'Thu', name: 'Thu' },
    { y: 'Fri', name: 'Fri' },
  ],
  animate: 'apex',
}" :height="300" />

```ts
new Chart('#el', {
  type: 'heatmap',
  data, // [{ h: '12a', Mon: 4, Tue: 9, ... }, ...]
  x: 'h', // columns
  series: [{ y: 'Mon' }, { y: 'Tue' } /* ...rows */],
});
```
