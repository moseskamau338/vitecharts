# Bar & Column

<script setup>
const data = [
  { q: 'Q1', a: 44, b: 13, c: 11 }, { q: 'Q2', a: 55, b: 23, c: 17 },
  { q: 'Q3', a: 41, b: 20, c: 15 }, { q: 'Q4', a: 67, b: 8, c: 21 },
]
const profit = [
  { m: 'Jan', p: 12 }, { m: 'Feb', p: -8 }, { m: 'Mar', p: 5 },
  { m: 'Apr', p: -3 }, { m: 'May', p: 17 }, { m: 'Jun', p: 9 },
]
</script>

Vertical bars (columns) use `type: 'bar'`. Watch them grow from the baseline on load.

<ChartDemo :options="{ type: 'bar', data, x: 'q', series: [{ y: 'a', name: 'Revenue' }], animate: 'apex' }" />

## Grouped

Multiple bar series sit side by side within each category.

<ChartDemo :options="{
  type: 'bar',
  data,
  x: 'q',
  series: [
    { y: 'a', name: 'Product A' },
    { y: 'b', name: 'Product B' },
    { y: 'c', name: 'Product C' },
  ],
  legend: true,
  animate: 'apex',
}" />

## Stacked

<ChartDemo :options="{
  type: 'bar',
  data,
  x: 'q',
  series: [
    { y: 'a', name: 'Product A' },
    { y: 'b', name: 'Product B' },
    { y: 'c', name: 'Product C' },
  ],
  stack: true,
  legend: true,
  animate: 'apex',
}" />

```ts
new Chart('#el', { type: 'bar', data, x: 'q', series: [{ y: 'a' }, { y: 'b' }], stack: true });
```

## Negative values

Bars handle negative values, growing below the zero baseline.

<ChartDemo :options="{ type: 'bar', data: profit, x: 'm', series: [{ y: 'p', name: 'Profit' }], animate: 'apex' }" />
