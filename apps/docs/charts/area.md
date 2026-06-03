# Area

<script setup>
const data = [
  { m: 'Jan', a: 31, b: 11 }, { m: 'Feb', a: 40, b: 32 }, { m: 'Mar', a: 28, b: 45 },
  { m: 'Apr', a: 51, b: 32 }, { m: 'May', a: 42, b: 34 }, { m: 'Jun', a: 109, b: 52 },
  { m: 'Jul', a: 100, b: 41 },
]
</script>

Area charts fill the region under a line. Use `type: 'area'`.

<ChartDemo :options="{ type: 'area', data, x: 'm', series: [{ y: 'a', name: 'Series A', curve: 'smooth' }], animate: 'apex' }" />

```ts
new Chart('#el', { type: 'area', data, x: 'm', series: [{ y: 'a', curve: 'smooth' }] });
```

## Overlapping areas

Each series fills independently with a translucent `fillOpacity`.

<ChartDemo :options="{
  type: 'area',
  data,
  x: 'm',
  series: [
    { y: 'a', name: 'A', curve: 'smooth' },
    { y: 'b', name: 'B', curve: 'smooth' },
  ],
  legend: true,
  animate: 'apex',
}" />

## Stacked area

Set `stack: true` to stack series on top of one another.

<ChartDemo :options="{
  type: 'area',
  data,
  x: 'm',
  series: [
    { y: 'a', name: 'A', curve: 'smooth' },
    { y: 'b', name: 'B', curve: 'smooth' },
  ],
  stack: true,
  legend: true,
  animate: 'apex',
}" />

```ts
new Chart('#el', { type: 'area', data, x: 'm', series: [{ y: 'a' }, { y: 'b' }], stack: true });
```
