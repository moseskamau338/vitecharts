# Radar

<script setup>
const data = [
  { axis: 'Speed', a: 80, b: 60 },
  { axis: 'Power', a: 65, b: 75 },
  { axis: 'Range', a: 50, b: 70 },
  { axis: 'Defense', a: 70, b: 55 },
  { axis: 'Agility', a: 90, b: 50 },
  { axis: 'Stealth', a: 40, b: 85 },
]
</script>

Each row is an axis around the circle; each series becomes a polygon over a shared radial
scale.

<ChartDemo :options="{
  type: 'radar',
  data,
  x: 'axis',
  series: [
    { y: 'a', name: 'Alpha' },
    { y: 'b', name: 'Bravo' },
  ],
  legend: true,
  animate: 'apex',
}" :height="380" />

```ts
new Chart('#el', {
  type: 'radar',
  data,
  x: 'axis',
  series: [
    { y: 'a', name: 'Alpha' },
    { y: 'b', name: 'Bravo' },
  ],
});
```
