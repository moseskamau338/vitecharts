# Funnel

<script setup>
const data = [
  { stage: 'Visits', value: 5200 },
  { stage: 'Signups', value: 3400 },
  { stage: 'Trials', value: 1800 },
  { stage: 'Paid', value: 920 },
  { stage: 'Renewed', value: 540 },
]
</script>

Each row is a funnel stage: the label comes from `x` and the value from the first series.
Stages taper toward the next stage's width.

<ChartDemo :options="{ type: 'funnel', data, x: 'stage', series: [{ y: 'value' }], animate: 'apex' }" :height="340" />

```ts
new Chart('#el', { type: 'funnel', data, x: 'stage', series: [{ y: 'value' }] });
```
