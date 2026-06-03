# Brushing & Sync

## Brush → detail (scrubbing)

Enable `brush: true` on an overview chart. Dragging across it emits a `brushSelection` event
with the data values at the edges — wire those to a detail chart's `axes.x.min/max`.

<BrushDemo />

```ts
const detail = new Chart('#detail', { type: 'area', data, x: 't', series: [{ y: 'v' }] });
const overview = new Chart('#overview', {
  type: 'line',
  data,
  x: 't',
  series: [{ y: 'v' }],
  brush: true,
  height: 90,
});

overview.on('brushSelection', ({ x0, x1 }) => {
  detail.update({ axes: { x: { min: Number(x0), max: Number(x1) } } });
});
```

## Synced charts

Give multiple charts the same `group` id and they mirror the hover crosshair + tooltip.
Hover either chart below:

<SyncDemo />

```ts
new Chart('#cpu', { type: 'line', data, x: 'h', series: [{ y: 'cpu' }], group: 'metrics' });
new Chart('#mem', { type: 'area', data, x: 'h', series: [{ y: 'mem' }], group: 'metrics' });
```
