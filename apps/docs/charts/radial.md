# Radial & Gauge

<script setup>
const polar = [
  { label: 'A', value: 14 }, { label: 'B', value: 23 }, { label: 'C', value: 21 },
  { label: 'D', value: 17 }, { label: 'E', value: 15 }, { label: 'F', value: 10 },
]
const gauge = [
  { label: 'CPU', value: 76 },
  { label: 'Memory', value: 54 },
  { label: 'Disk', value: 39 },
]
</script>

## Polar area

Equal angles; the radius encodes each value.

<ChartDemo :options="{ type: 'polarArea', data: polar, x: 'label', series: [{ y: 'value' }], animate: 'apex' }" :height="360" />

```ts
new Chart('#el', { type: 'polarArea', data: polar, x: 'label', series: [{ y: 'value' }] });
```

## Radial bar (gauge)

Concentric rings, each filling to its value as a fraction of the max.

<ChartDemo :options="{ type: 'radialBar', data: gauge, x: 'label', series: [{ y: 'value' }], animate: 'apex' }" :height="360" />

```ts
new Chart('#el', { type: 'radialBar', data: gauge, x: 'label', series: [{ y: 'value' }] });
```
