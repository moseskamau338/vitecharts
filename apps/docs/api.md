# API reference

## `new Chart(target, options)`

```ts
import { Chart } from '@vitecharts/core';
const chart = new Chart('#el' /* or HTMLElement */, options);
```

### Options

| Option        | Type                                               | Description                                   |
| ------------- | -------------------------------------------------- | --------------------------------------------- |
| `type`        | see chart types below                              | Chart type.                                   |
| `data`        | `Row[]`                                            | Array of row objects.                         |
| `x`           | `string`                                           | Key in each row for the x value.              |
| `series`      | `SeriesOption[]`                                   | One or more series (see below).               |
| `width`       | `number`                                           | Fixed width; omit to size from the container. |
| `height`      | `number`                                           | Fixed height (default 360).                   |
| `padding`     | `{ top, right, bottom, left }`                     | Plot padding.                                 |
| `axes`        | `{ x?: AxisOption, y?: AxisOption }`               | Axis config.                                  |
| `colors`      | `string[]`                                         | Palette override.                             |
| `theme`       | `'light'` `'dark'` or partial theme                | Theme.                                        |
| `animate`     | `boolean` `'apex'` `'material'` `'none'` or object | Animation (incl. update-morph).               |
| `markers`     | `boolean`                                          | Point markers on line/area.                   |
| `dataLabels`  | `boolean`                                          | Value labels per datum (count up on update).  |
| `stack`       | `boolean`                                          | Stack area/bar series.                        |
| `sparkline`   | `boolean`                                          | Chromeless inline mode.                       |
| `tooltip`     | `boolean` or `{ shared?, render? }`                | Tooltip (default on).                         |
| `legend`      | `boolean` or `{ position? }`                       | Legend (default off).                         |
| `crosshair`   | `boolean`                                          | Hover crosshair.                              |
| `zoom`        | `boolean`                                          | Wheel + selection zoom (numeric/time x).      |
| `pan`         | `boolean`                                          | Drag-to-pan.                                  |
| `toolbar`     | `boolean`                                          | Zoom controls + export menu.                  |
| `innerRadius` | `number` (0–1)                                     | Pie/donut hole size.                          |
| `annotations` | `Annotation[]`                                     | Overlay lines/regions/points.                 |
| `brush`       | `boolean`                                          | Drag-to-select; emits `brushSelection`.       |
| `group`       | `string`                                           | Sync hover across charts.                     |
| `ariaLabel`   | `string`                                           | Accessible label.                             |

**Chart types:** `line` `area` `bar` `scatter` `combo` (per-series `type`) ·
`candlestick` `boxplot` `rangeBar` `rangeArea` · `pie` `donut` `polarArea` `radialBar`
`radar` · `funnel` `heatmap`.

### `SeriesOption`

| Field                           | Type                             | Notes                               |
| ------------------------------- | -------------------------------- | ----------------------------------- |
| `y`                             | `string`                         | Row key for this series' value.     |
| `name`                          | `string`                         | Display name (defaults to `y`).     |
| `color`                         | `string`                         | Override color.                     |
| `type`                          | chart type                       | Per-series override (combo).        |
| `curve`                         | `linear` `smooth` `step` `basis` | Line interpolation.                 |
| `fillOpacity`                   | `number`                         | Area/bar fill opacity.              |
| `gradient`                      | `boolean`                        | Vertical gradient fill.             |
| `dash`                          | `string`                         | Dashed stroke (`stroke-dasharray`). |
| `size`                          | `string`                         | Row key for bubble radius.          |
| `open`/`high`/`low`/`close`     | `string`                         | Candlestick OHLC keys.              |
| `low`/`q1`/`median`/`q3`/`high` | `string`                         | Boxplot / range keys.               |

### `AxisOption`

| Field       | Type                | Notes                                |
| ----------- | ------------------- | ------------------------------------ |
| `type`      | scale type          | `linear` `log` `time` `band` `point` |
| `ticks`     | `number`            | Target tick count.                   |
| `min`/`max` | `number`            | Hard domain bounds.                  |
| `format`    | `(value) => string` | Tick label formatter.                |

## Methods

```ts
chart.update(patch); // merge partial options + re-render
chart.updateSeries(series); // replace series
chart.setData(data); // replace dataset
chart.appendData(rowOrRows); // append (animated streaming)
chart.toSVG(); // → string
chart.toPNG(scale?); // → Promise<string> (data URL)
chart.toCSV(); // → string
chart.toJSON(); // → string
chart.download(format, filename?); // 'svg' | 'png' | 'csv' | 'json'
chart.zoomIn(); // numeric/time x only
chart.zoomOut();
chart.resetZoom();
chart.on(event, handler); // → unsubscribe fn
chart.destroy();
```

All mutators return `this` and are chainable.

## Events

| Event            | Payload                         |
| ---------------- | ------------------------------- |
| `pointerMove`    | `{ group, x, y }`               |
| `pointerLeave`   | `undefined`                     |
| `markerClick`    | `{ point }`                     |
| `legendClick`    | `{ seriesIndex, name, hidden }` |
| `brushSelection` | `{ x0, x1, px0, px1 }`          |
| `zoomed`         | `{ min, max }` or `null`        |

## Exports

Beyond `Chart`, the package exports the building blocks: `compileSpec`, `buildScale`,
`drawLine` / `drawArea` / `drawBar` / `drawArc`, `signal` / `effect` / `computed`,
`tween` / `createSpring` / `resolveAnimation`, `serializeSvg` / `toCSV` / `toJSON`, `lttb`,
`SvgRenderer` / `CanvasRenderer`, and the theme helpers.
