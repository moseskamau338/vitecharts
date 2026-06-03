import { registry } from './charts/registry.js';
import { DEFAULT_COLORS } from './palette.js';
import { SvgRenderer } from './renderer/svg.js';
import type { Renderer } from './renderer/types.js';
import type { ChartOptions, Padding, ResolvedOptions } from './types.js';

const DEFAULT_PADDING: Padding = { top: 20, right: 24, bottom: 32, left: 48 };
const DEFAULT_HEIGHT = 360;
const FALLBACK_WIDTH = 640;

function resolveOptions(o: ChartOptions): ResolvedOptions {
  return {
    ...o,
    padding: { ...DEFAULT_PADDING, ...o.padding },
    colors: o.colors ?? DEFAULT_COLORS,
  };
}

/**
 * The imperative entry point. Mirrors the lifecycle from the roadmap:
 * `create → render → update → resize → destroy`.
 */
export class Chart {
  private readonly container: HTMLElement;
  private readonly renderer: Renderer;
  private options: ChartOptions;
  private observer?: ResizeObserver;

  constructor(target: string | HTMLElement, options: ChartOptions) {
    const el =
      typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target;
    if (!el) throw new Error(`ViteCharts: render target not found: ${String(target)}`);

    this.container = el;
    this.options = options;
    this.renderer = new SvgRenderer(el);
    this.render();

    // Responsive: re-render on container resize unless a fixed width was given.
    if (options.width == null && typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => this.render());
      this.observer.observe(el);
    }
  }

  /** Merge a partial patch into the current options and re-render. */
  update(patch: Partial<ChartOptions>): this {
    this.options = { ...this.options, ...patch };
    this.render();
    return this;
  }

  private render(): void {
    const width = this.options.width ?? (this.container.clientWidth || FALLBACK_WIDTH);
    const height = this.options.height ?? DEFAULT_HEIGHT;

    const chart = registry[this.options.type];
    if (!chart) throw new Error(`ViteCharts: unknown chart type "${this.options.type}"`);

    this.renderer.clear();
    this.renderer.resize(width, height);
    chart.render({
      renderer: this.renderer,
      width,
      height,
      options: resolveOptions(this.options),
    });
  }

  /** Tear down observers and unmount the surface. */
  destroy(): void {
    this.observer?.disconnect();
    this.renderer.destroy();
  }
}
