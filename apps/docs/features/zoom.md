# Zoom, Pan & Toolbar

<script setup>
const data = Array.from({ length: 120 }, (_, i) => ({
  t: i,
  v: 50 + Math.sin(i / 8) * 25 + Math.cos(i / 3) * 8,
}))
</script>

Zoom works on a **numeric or time** x axis. Scroll to zoom, drag-select a range to zoom into
it, and use the toolbar to step in/out or reset. (Set `pan: true` to drag-pan instead of
select.)

<ChartDemo :options="{
  type: 'line',
  data,
  x: 't',
  series: [{ y: 'v', name: 'Signal', curve: 'smooth' }],
  zoom: true,
  toolbar: true,
  animate: 'apex',
}" :height="340" />

```ts
new Chart('#el', {
  type: 'line',
  data,
  x: 't',
  series: [{ y: 'v' }],
  zoom: true, // wheel + selection zoom
  pan: true, // drag to pan
  toolbar: true, // zoom in/out/reset + export menu
});

chart.on('zoomed', (range) => console.log(range)); // { min, max } | null
```

## Imperative control

```ts
chart.zoomIn();
chart.zoomOut();
chart.resetZoom();
```

The **toolbar** also exposes the export menu (SVG / PNG / CSV / JSON) — see [Export](/features/export).
