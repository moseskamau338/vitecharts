import { resolveAnimation } from './anim/presets.js';
import type { TweenHandle } from './anim/tween.js';
import { registry } from './charts/registry.js';
import { effect, signal, type Signal } from './reactive/signal.js';
import { SvgRenderer } from './renderer/svg.js';
import type { Renderer } from './renderer/types.js';
import { compileSpec } from './spec/compile.js';
import type { ChartOptions, Row, SeriesOption } from './types.js';

const DEFAULT_HEIGHT = 360;
const FALLBACK_WIDTH = 640;

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
 * lifecycle `create → render → update → resize → destroy`.
 */
export class Chart {
  private readonly renderer: Renderer;
  private readonly options: Signal<ChartOptions>;
  private readonly containerWidth: Signal<number>;
  private readonly dispose: () => void;
  private readonly runner = new AnimationRunner();
  private firstRender = true;
  private observer?: ResizeObserver;

  constructor(target: string | HTMLElement, options: ChartOptions) {
    const el =
      typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target;
    if (!el) throw new Error(`ViteCharts: render target not found: ${String(target)}`);

    this.renderer = new SvgRenderer(el);
    this.options = signal(options);
    this.containerWidth = signal(el.clientWidth);

    // Reactive render loop: reads both signals, so updates and resizes redraw.
    this.dispose = effect(() => {
      const opts = this.options.value;
      const measured = this.containerWidth.value;
      const width = opts.width ?? (measured || FALLBACK_WIDTH);
      const height = opts.height ?? DEFAULT_HEIGHT;
      this.draw(opts, width, height);
    });

    if (options.width == null && typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => {
        this.containerWidth.value = el.clientWidth;
      });
      this.observer.observe(el);
    }
  }

  private draw(options: ChartOptions, width: number, height: number): void {
    const spec = compileSpec(options);
    const chart = registry[spec.type];
    if (!chart) throw new Error(`ViteCharts: unknown chart type "${spec.type}"`);

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
    });
    this.firstRender = false;
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

  /** Tear down the render effect, observer, animations, and surface. */
  destroy(): void {
    this.observer?.disconnect();
    this.runner.cancelAll();
    this.dispose();
    this.renderer.destroy();
  }
}
