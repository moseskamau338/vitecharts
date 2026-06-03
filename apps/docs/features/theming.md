# Theming

<script setup>
const data = [
  { m: 'Jan', v: 30 }, { m: 'Feb', v: 44 }, { m: 'Mar', v: 35 },
  { m: 'Apr', v: 55 }, { m: 'May', v: 49 }, { m: 'Jun', v: 70 },
]
</script>

Built-in `light` and `dark` themes ship out of the box. Toggle this one:

<ThemeDemo />

```ts
new Chart('#el', { theme: 'dark' });
```

## Custom palette

Override series colors with `colors` (cycled across series):

<ChartDemo :options="{
  type: 'bar',
  data,
  x: 'm',
  series: [{ y: 'v', name: 'Revenue' }],
  colors: ['#7c3aed'],
  animate: 'apex',
}" />

```ts
new Chart('#el', { colors: ['#7c3aed', '#06b6d4', '#f59e0b'] });
```

## Theme overrides

Pass a partial theme object to tweak individual tokens:

```ts
new Chart('#el', {
  theme: {
    background: '#0f172a',
    gridColor: '#1e293b',
    axisColor: '#334155',
    labelColor: '#94a3b8',
    colors: ['#38bdf8', '#34d399'],
  },
});
```

| Token        | Purpose         |
| ------------ | --------------- |
| `colors`     | Series palette  |
| `background` | Plot background |
| `axisColor`  | Axis lines      |
| `gridColor`  | Gridlines       |
| `labelColor` | Tick labels     |
| `fontFamily` | Text font stack |
