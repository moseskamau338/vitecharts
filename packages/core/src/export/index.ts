import type { ChartOptions, Row } from '../types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Serialize an SVG element to a standalone, namespaced string. */
export function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', SVG_NS);
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  const xml = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}

/** Rasterize an SVG element to a PNG data URL (browser only). */
export async function svgToPngDataUrl(svg: SVGSVGElement, scale = 2): Promise<string> {
  const width = svg.width.baseVal.value || svg.clientWidth || 640;
  const height = svg.height.baseVal.value || svg.clientHeight || 360;
  const svgString = serializeSvg(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ViteCharts: 2D canvas context unavailable');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('ViteCharts: failed to rasterize SVG'));
    img.src = url;
  });
}

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialize the dataset to CSV with the x column followed by each series column. */
export function toCSV(data: ReadonlyArray<Row>, xKey: string, yKeys: string[]): string {
  const cols = [xKey, ...yKeys];
  const header = cols.map(csvCell).join(',');
  const rows = data.map((row) => cols.map((c) => csvCell(row[c])).join(','));
  return [header, ...rows].join('\n');
}

/** Serialize chart options (type + series + data) to pretty JSON. */
export function toJSON(options: ChartOptions): string {
  return JSON.stringify(
    { type: options.type, x: options.x, series: options.series, data: options.data },
    null,
    2,
  );
}

/** Trigger a browser download of `content` as a file. */
export function downloadFile(filename: string, content: string | Blob, mime: string): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
