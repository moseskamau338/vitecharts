# Animation

<script setup>
const data = [
  { m: 'Jan', v: 30 }, { m: 'Feb', v: 40 }, { m: 'Mar', v: 35 },
  { m: 'Apr', v: 55 }, { m: 'May', v: 49 }, { m: 'Jun', v: 70 }, { m: 'Jul', v: 62 },
]
</script>

Animation is on by default with the `apex` preset. Lines draw on, bars grow from the
baseline, arcs sweep, and markers pop — staggered across series.

## Presets

Pass `animate` as a preset name, a boolean, or a detailed object.

<ChartDemo :options="{ type: 'bar', data, x: 'm', series: [{ y: 'v', name: 'apex preset' }], animate: 'apex' }" />

```ts
new Chart('#el', { animate: 'apex' }); // default — Apex-like
new Chart('#el', { animate: 'material' }); // snappier
new Chart('#el', { animate: false }); // off (also: 'none')
new Chart('#el', {
  animate: { preset: 'apex', duration: 1200, easing: 'easeOutBack', stagger: 200 },
});
```

| Field      | Default | Notes                                     |
| ---------- | ------- | ----------------------------------------- |
| `preset`   | `apex`  | `apex` · `material` · `none`              |
| `duration` | 800     | Enter-animation length (ms)               |
| `easing`   | —       | Named easing, e.g. `easeOutCubic`         |
| `delay`    | 0       | Initial delay (ms)                        |
| `stagger`  | 120     | Per-series delay (ms)                     |
| `dynamic`  | true    | Animate updates, not just the first mount |

## Reduced motion

When the user's OS requests reduced motion (`prefers-reduced-motion: reduce`), animations
are disabled automatically and the chart renders its final frame instantly — no extra config.

## Streaming

Append data over time and the chart updates live. Press start:

<StreamDemo />

```ts
setInterval(() => chart.appendData({ t: Date.now(), v: read() }), 1000);
```
