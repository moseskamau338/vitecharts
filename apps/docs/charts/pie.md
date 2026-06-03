# Pie & Donut

<script setup>
const data = [
  { label: 'Direct', value: 44 },
  { label: 'Organic', value: 55 },
  { label: 'Referral', value: 13 },
  { label: 'Social', value: 33 },
  { label: 'Email', value: 21 },
]
</script>

Each row is a slice: the `x` key is the label and the first `series` provides the value.
Slices sweep in on load.

<ChartDemo :options="{ type: 'pie', data, x: 'label', series: [{ y: 'value' }], animate: 'apex' }" :height="360" />

```ts
new Chart('#el', { type: 'pie', data, x: 'label', series: [{ y: 'value' }] });
```

## Donut

`type: 'donut'` cuts a hole (default `innerRadius: 0.6`) and shows the total in the center.

<ChartDemo :options="{ type: 'donut', data, x: 'label', series: [{ y: 'value' }], animate: 'apex' }" :height="360" />

```ts
new Chart('#el', { type: 'donut', data, x: 'label', series: [{ y: 'value' }] });
// custom hole size:
new Chart('#el', { type: 'pie', innerRadius: 0.4, data, x: 'label', series: [{ y: 'value' }] });
```
