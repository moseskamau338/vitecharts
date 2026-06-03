# Financial & Statistical

<script setup>
const ohlc = [
  { d: 'Mon', o: 30, h: 38, l: 28, c: 36 },
  { d: 'Tue', o: 36, h: 40, l: 33, c: 34 },
  { d: 'Wed', o: 34, h: 35, l: 26, c: 28 },
  { d: 'Thu', o: 28, h: 33, l: 27, c: 32 },
  { d: 'Fri', o: 32, h: 44, l: 31, c: 42 },
  { d: 'Sat', o: 42, h: 45, l: 38, c: 39 },
]
const box = [
  { g: 'A', min: 5, q1: 12, med: 18, q3: 26, max: 34 },
  { g: 'B', min: 8, q1: 15, med: 22, q3: 30, max: 40 },
  { g: 'C', min: 3, q1: 10, med: 14, q3: 20, max: 28 },
]
const range = [
  { m: 'Jan', lo: 12, hi: 22 }, { m: 'Feb', lo: 14, hi: 26 }, { m: 'Mar', lo: 10, hi: 24 },
  { m: 'Apr', lo: 16, hi: 30 }, { m: 'May', lo: 18, hi: 34 }, { m: 'Jun', lo: 15, hi: 28 },
]
</script>

## Candlestick (OHLC)

A series with `open` / `high` / `low` / `close` keys. Up candles are green, down red,
and they sweep in on load.

<ChartDemo :options="{
  type: 'candlestick',
  data: ohlc,
  x: 'd',
  series: [{ y: 'c', open: 'o', high: 'h', low: 'l', close: 'c' }],
  animate: 'apex',
}" />

```ts
new Chart('#el', {
  type: 'candlestick',
  data: ohlc,
  x: 'd',
  series: [{ y: 'c', open: 'o', high: 'h', low: 'l', close: 'c' }],
});
```

## Boxplot

A series with `low` (min) / `q1` / `median` / `q3` / `high` (max) keys.

<ChartDemo :options="{
  type: 'boxplot',
  data: box,
  x: 'g',
  series: [{ y: 'med', low: 'min', q1: 'q1', median: 'med', q3: 'q3', high: 'max' }],
  animate: 'apex',
}" />

```ts
series: [{ y: 'med', low: 'min', q1: 'q1', median: 'med', q3: 'q3', high: 'max' }];
```

## Range area & bar

A `low`/`high` pair renders a band (`rangeArea`) or floating bars (`rangeBar`).

<ChartDemo :options="{
  type: 'rangeArea',
  data: range,
  x: 'm',
  series: [{ y: 'hi', low: 'lo', high: 'hi', name: 'Range', curve: 'smooth' }],
  animate: 'apex',
}" />

<ChartDemo :options="{
  type: 'rangeBar',
  data: range,
  x: 'm',
  series: [{ y: 'hi', low: 'lo', high: 'hi', name: 'Range' }],
  animate: 'apex',
}" />
