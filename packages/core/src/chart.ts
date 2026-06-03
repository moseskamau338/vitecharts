import { resolveAnimation } from './anim/presets.js';
import type { TweenHandle } from './anim/tween.js';
import { registry } from './charts/registry.js';
import { downloadFile, serializeSvg, svgToPngDataUrl, toCSV, toJSON } from './export/index.js';
import { Emitter } from './events.js';
import { BrushController } from './interaction/brush.js';
import { InteractionController } from './interaction/controller.js';
import { Legend, type LegendPosition } from './interaction/legend.js';
import { broadcastHide, broadcastShow, joinSyncGroup } from './interaction/sync.js';
import { Toolbar, type ExportFormat } from './interaction/toolbar.js';
import { Tooltip } from './interaction/tooltip.js';
import { ZoomController, type Range } from './interaction/zoom.js';
import type { ChartEventMap, PlotBounds } from './interaction/types.js';
import { effect, signal, type Signal } from './reactive/signal.js';
import { SvgRenderer } from './renderer/svg.js';
import { compileSpec } from './spec/compile.js';
import type { ResolvedTheme } from './theme.js';
import type { ChartOptions, Row, SeriesOption } from './types.js';

const DEFAULT_HEIGHT = 360;
const FALLBACK_WIDTH = 640;

/** Coerce an x value to a number for zoom math (Date → ms), else null. */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  return null;
}

/** Tracks in-flight tweens so they can be cancelled on redraw / destroy. */
class AnimationRunner {
  private readonly active = new Set<TweenHandle>();

  track(handle: TweenHandle | null): void {
    if (handle && !handle.done) this.active.add(handle);
  }

  cancelAll(): void {
    for (const handle of this.active) handle.cancel();
    this.active.clear();
  }
}

/**
 * The imperative entry point. Options and container width are reactive signals;
 * a single render effect re-draws whenever either changes, implementing the
 * lifecycle `create → render → update → resize → destroy`. Tooltip, crosshair,
 * legend, and the event bus are wired on the first render.
 */
export class Chart {
  private readonly renderer: SvgRenderer;
  private readonly options: Signal<ChartOptions>;
  private readonly containerWidth: Signal<number>;
  private readonly dispose: () => void;
  private readonly runner = new AnimationRunner();
  private readonly emitter = new Emitter<ChartEventMap>();
  private readonly hidden = new Set<number>();
  private firstRender = true;
  private observer?: ResizeObserver;
  private tooltip: Tooltip | null = null;
  private legend: Legend | null = null;
  private controller: InteractionController | null = null;
  private brush: BrushController | null = null;
  private zoomCtl: ZoomController | null = null;
  private toolbar: Toolbar | null = null;
  private leaveSyncGroup: (() => void) | null = null;
  private zoomWindow: Range | null = null;
  private bounds: PlotBounds | null = null;

  constructor(target: string | HTMLElement, options: ChartOptions) {
    const el =
      typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target;
    if (!el) throw new Error(`ViteCharts: render target not found: ${String(target)}`);

    if (!el.style.position || el.style.position === 'static') el.style.position = 'relative';

    this.renderer = new SvgRenderer(el);
    this.options = signal(options);
    this.containerWidth = signal(el.clientWidth);

    // Reactive render loop: reads both signals, so updates and resizes redraw.
    this.dispose = effect(() => {
      const opts = this.options.value;
      const measured = this.containerWidth.value;
      const width = opts.width ?? (measured || FALLBACK_WIDTH);
      const height = opts.height ?? DEFAULT_HEIGHT;
      this.draw(el, opts, width, height);
    });

    if (options.width == null && typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => {
        this.containerWidth.value = el.clientWidth;
      });
      this.observer.observe(el);
    }
  }

  private draw(container: HTMLElement, options: ChartOptions, width: number, height: number): void {
    const drawOptions = this.applyZoom(options);
    const spec = compileSpec(drawOptions);
    spec.series.forEach((s, i) => {
      s.hidden = this.hidden.has(i);
    });

    const chart = registry[spec.type];
    if (!chart) throw new Error(`ViteCharts: unknown chart type "${spec.type}"`);

    if (this.firstRender) this.setupInteraction(container, options, spec.theme);

    // Cancel any tweens from the previous frame before clearing their nodes.
    this.runner.cancelAll();
    const config = resolveAnimation(options.animate);
    const enter = this.firstRender;

    this.renderer.clear();
    this.renderer.resize(width, height);
    chart.render({
      renderer: this.renderer,
      width,
      height,
      spec,
      animation: { config, enter, track: (h) => this.runner.track(h) },
      scene: {
        setModel: (m) => {
          this.bounds = m.bounds;
          this.controller?.setModel(m);
          this.brush?.setModel(m);
        },
      },
    });

    this.applyA11y(options, spec.type, spec.series.length);

    this.legend?.setItems(
      spec.series.map((s) => ({ name: s.name, color: s.color, hidden: s.hidden })),
    );
    this.firstRender = false;
  }

  /** Set ARIA role/label and a <title> so screen readers can describe the chart. */
  private applyA11y(options: ChartOptions, type: string, seriesCount: number): void {
    const svg = this.renderer.mount;
    const label = options.ariaLabel ?? `${type} chart with ${seriesCount} series`;
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = label;
    svg.insertBefore(title, svg.firstChild);
  }

  /** Numeric/time extent of the x values, or null when x is categorical. */
  private xExtent(options: ChartOptions): Range | null {
    const nums: number[] = [];
    for (const row of options.data) {
      const n = toNumber(row[options.x]);
      if (n == null) return null; // any non-numeric x → no zoom
      nums.push(n);
    }
    if (nums.length === 0) return null;
    return [Math.min(...nums), Math.max(...nums)];
  }

  /** Filter data + clamp the x axis to the current zoom window. */
  private applyZoom(options: ChartOptions): ChartOptions {
    if (!this.zoomWindow) return options;
    const [w0, w1] = this.zoomWindow;
    const data = options.data.filter((row) => {
      const n = toNumber(row[options.x]);
      return n != null && n >= w0 && n <= w1;
    });
    return {
      ...options,
      data,
      axes: { ...options.axes, x: { ...options.axes?.x, min: w0, max: w1 } },
    };
  }

  private setZoom(window: Range | null): void {
    this.zoomWindow = window;
    this.emitter.emit('zoomed', window ? { min: window[0], max: window[1] } : null);
    this.options.value = { ...this.options.value }; // force redraw
  }

  private zoomBy(factor: number): void {
    const extent = this.xExtent(this.options.value);
    if (!extent) return;
    const [w0, w1] = this.zoomWindow ?? extent;
    const center = (w0 + w1) / 2;
    const half = ((w1 - w0) / 2) * factor;
    const min = Math.max(extent[0], center - half);
    const max = Math.min(extent[1], center + half);
    this.setZoom([min, max]);
  }

  /** Zoom the x axis in (numeric/time x only). */
  zoomIn(): this {
    this.zoomBy(0.6);
    return this;
  }

  /** Zoom the x axis out. */
  zoomOut(): this {
    this.zoomBy(1 / 0.6);
    return this;
  }

  /** Reset the zoom window. */
  resetZoom(): this {
    this.setZoom(null);
    return this;
  }

  private setupInteraction(
    container: HTMLElement,
    options: ChartOptions,
    theme: ResolvedTheme,
  ): void {
    const t = options.tooltip;
    const tooltipOn = t !== false && !options.sparkline;
    const custom = typeof t === 'object' ? t.render : undefined;
    const crosshairOn = (options.crosshair ?? tooltipOn) && !options.sparkline;

    if (tooltipOn) this.tooltip = new Tooltip(container, theme, custom);

    if (tooltipOn || crosshairOn) {
      this.controller = new InteractionController(this.renderer.mount, this.tooltip, this.emitter, {
        crosshair: crosshairOn,
        theme,
      });
    }

    const legendOpt = options.legend;
    if (legendOpt !== undefined && legendOpt !== false) {
      const position: LegendPosition =
        typeof legendOpt === 'object' ? (legendOpt.position ?? 'bottom') : 'bottom';
      this.legend = new Legend(container, position, theme, (i) => this.toggleSeries(i));
    }

    if (options.brush) {
      this.brush = new BrushController(
        this.renderer.mount,
        this.emitter,
        theme.colors[0] ?? '#008FFB',
      );
    }

    // Sync group: mirror hover to peers sharing the same group id.
    const groupId = options.group;
    if (groupId && this.controller) {
      const peer = {
        showAt: (xRaw: unknown) => {
          const g = this.controller?.findByXRaw(xRaw);
          if (g) this.controller?.showGroup(g);
        },
        hide: () => this.controller?.hide(),
      };
      this.leaveSyncGroup = joinSyncGroup(groupId, peer);
      this.on('pointerMove', ({ group }) => broadcastShow(groupId, peer, group.xRaw));
      this.on('pointerLeave', () => broadcastHide(groupId, peer));
    }

    // Zoom / pan / toolbar (numeric-or-time x only for zoom).
    const zoomable = this.xExtent(options) != null;
    if ((options.zoom || options.pan) && zoomable) {
      this.zoomCtl = new ZoomController(this.renderer.mount, {
        bounds: () => this.bounds,
        window: () => this.zoomWindow,
        extent: () => this.xExtent(this.options.value),
        onChange: (w) => this.setZoom(w),
        panEnabled: () => !!options.pan,
      });
    }
    // Selection-zoom: when zoom is on (and not panning), drag-select to zoom.
    if (options.zoom && !options.pan && zoomable && !this.brush) {
      this.brush = new BrushController(
        this.renderer.mount,
        this.emitter,
        theme.colors[0] ?? '#008FFB',
      );
      this.on('brushSelection', ({ x0, x1 }) => {
        const a = toNumber(x0);
        const b = toNumber(x1);
        if (a != null && b != null) this.setZoom([Math.min(a, b), Math.max(a, b)]);
      });
    }

    if (options.toolbar) {
      this.toolbar = new Toolbar(container, theme, {
        zoomable,
        zoomIn: () => this.zoomIn(),
        zoomOut: () => this.zoomOut(),
        reset: () => this.resetZoom(),
        download: (fmt: ExportFormat) => void this.download(fmt),
      });
    }
  }

  private toggleSeries(index: number): void {
    if (this.hidden.has(index)) this.hidden.delete(index);
    else this.hidden.add(index);
    const series = this.options.value.series[index];
    this.emitter.emit('legendClick', {
      seriesIndex: index,
      name: series?.name ?? series?.y ?? String(index),
      hidden: this.hidden.has(index),
    });
    // Force a redraw (new options ref) without an enter animation.
    this.options.value = { ...this.options.value };
  }

  /** Serialize the chart to a standalone SVG string. */
  toSVG(): string {
    return serializeSvg(this.renderer.mount);
  }

  /** Rasterize the chart to a PNG data URL (browser only). */
  toPNG(scale = 2): Promise<string> {
    return svgToPngDataUrl(this.renderer.mount, scale);
  }

  /** Serialize the current dataset to CSV. */
  toCSV(): string {
    const o = this.options.value;
    return toCSV(
      o.data,
      o.x,
      o.series.map((s) => s.y),
    );
  }

  /** Serialize the chart config + data to JSON. */
  toJSON(): string {
    return toJSON(this.options.value);
  }

  /** Download the chart as `svg` | `png` | `csv` | `json`. */
  async download(
    format: 'svg' | 'png' | 'csv' | 'json',
    filename = `chart.${format}`,
  ): Promise<void> {
    if (format === 'svg') downloadFile(filename, this.toSVG(), 'image/svg+xml');
    else if (format === 'csv') downloadFile(filename, this.toCSV(), 'text/csv');
    else if (format === 'json') downloadFile(filename, this.toJSON(), 'application/json');
    else {
      const dataUrl = await this.toPNG();
      const blob = await (await fetch(dataUrl)).blob();
      downloadFile(filename, blob, 'image/png');
    }
  }

  /** Subscribe to a chart event. Returns an unsubscribe function. */
  on<K extends keyof ChartEventMap>(
    type: K,
    handler: (payload: ChartEventMap[K]) => void,
  ): () => void {
    return this.emitter.on(type, handler);
  }

  /** Merge a partial patch into the current options and re-render. */
  update(patch: Partial<ChartOptions>): this {
    this.options.value = { ...this.options.value, ...patch };
    return this;
  }

  /** Replace the series definitions. */
  updateSeries(series: SeriesOption[]): this {
    return this.update({ series });
  }

  /** Replace the dataset. */
  setData(data: ReadonlyArray<Row>): this {
    return this.update({ data });
  }

  /** Append one or more rows to the dataset (for streaming/realtime). */
  appendData(rows: Row | ReadonlyArray<Row>): this {
    const incoming = Array.isArray(rows) ? rows : [rows as Row];
    return this.update({ data: [...this.options.value.data, ...incoming] });
  }

  /** Tear down the render effect, observer, animations, interaction, and surface. */
  destroy(): void {
    this.observer?.disconnect();
    this.runner.cancelAll();
    this.controller?.destroy();
    this.brush?.destroy();
    this.zoomCtl?.destroy();
    this.toolbar?.destroy();
    this.leaveSyncGroup?.();
    this.tooltip?.destroy();
    this.legend?.destroy();
    this.emitter.clear();
    this.dispose();
    this.renderer.destroy();
  }
}
