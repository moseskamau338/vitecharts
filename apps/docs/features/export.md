# Export

The chart can serialize itself to vector, raster, or data formats. Try the buttons:

<ExportDemo />

```ts
chart.toSVG(); // standalone SVG string (true vector)
await chart.toPNG(2); // PNG data URL at 2× scale
chart.toCSV(); // dataset as CSV (current data)
chart.toJSON(); // { type, x, series, data }

// Trigger a browser download:
chart.download('svg'); // 'svg' | 'png' | 'csv' | 'json'
chart.download('png', 'sales-2026.png');
```

The standalone export helpers are also exported directly:

```ts
import { serializeSvg, svgToPngDataUrl, toCSV, toJSON } from '@vitecharts/core';
```

::: tip
PNG export rasterizes the live SVG through a canvas, so it captures exactly what's on screen
(including the current theme). It runs in the browser only.
:::
