import type { Emitter } from '../events.js';
import type { ChartEventMap, InteractionModel } from './types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MIN_DRAG = 3;

/**
 * Drag-to-select brush over the plot area. On release it emits `brushSelection`
 * with the data values (x0/x1) at the selection edges — wire it to another
 * chart's `axes.x.min/max` to build a brush→detail (scrubbing) view.
 */
export class BrushController {
  private model: InteractionModel | null = null;
  private startX: number | null = null;
  private rect: SVGRectElement | null = null;

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly emitter: Emitter<ChartEventMap>,
    private readonly color: string,
  ) {
    svg.addEventListener('mousedown', this.onDown);
    svg.addEventListener('mousemove', this.onMove);
    this.win?.addEventListener('mouseup', this.onUp);
  }

  private get win(): Window | null {
    return this.svg.ownerDocument?.defaultView ?? null;
  }

  setModel(model: InteractionModel): void {
    this.model = model;
    this.clear();
  }

  private localX(e: MouseEvent): number {
    return e.clientX - this.svg.getBoundingClientRect().left;
  }

  private clampX(x: number): number {
    const b = this.model!.bounds;
    return Math.max(b.left, Math.min(b.right, x));
  }

  private onDown = (e: MouseEvent): void => {
    if (!this.model) return;
    const x = this.localX(e);
    const { left, right } = this.model.bounds;
    if (x < left || x > right) return;
    this.startX = this.clampX(x);
    this.draw(this.startX, this.startX);
  };

  private onMove = (e: MouseEvent): void => {
    if (this.startX == null || !this.model) return;
    this.draw(this.startX, this.clampX(this.localX(e)));
  };

  private onUp = (e: MouseEvent): void => {
    if (this.startX == null || !this.model) return;
    const end = this.clampX(this.localX(e));
    const px0 = Math.min(this.startX, end);
    const px1 = Math.max(this.startX, end);
    this.startX = null;
    if (px1 - px0 < MIN_DRAG) {
      this.clear();
      return;
    }
    this.emitter.emit('brushSelection', {
      x0: this.nearestRaw(px0),
      x1: this.nearestRaw(px1),
      px0,
      px1,
    });
  };

  private nearestRaw(px: number): unknown {
    if (!this.model) return undefined;
    let best: unknown;
    let bestDist = Infinity;
    for (const g of this.model.groups) {
      const d = Math.abs(g.x - px);
      if (d < bestDist) {
        bestDist = d;
        best = g.xRaw;
      }
    }
    return best;
  }

  private draw(a: number, b: number): void {
    if (!this.model) return;
    const { top, bottom } = this.model.bounds;
    if (!this.rect) {
      this.rect = document.createElementNS(SVG_NS, 'rect');
      this.rect.setAttribute('class', 'vitecharts-brush');
      this.rect.setAttribute('fill', this.color);
      this.rect.setAttribute('fill-opacity', '0.15');
      this.rect.setAttribute('stroke', this.color);
      this.rect.setAttribute('stroke-opacity', '0.5');
      this.rect.setAttribute('pointer-events', 'none');
      this.svg.appendChild(this.rect);
    }
    this.rect.setAttribute('x', String(Math.min(a, b)));
    this.rect.setAttribute('y', String(top));
    this.rect.setAttribute('width', String(Math.abs(b - a)));
    this.rect.setAttribute('height', String(bottom - top));
  }

  private clear(): void {
    this.rect?.remove();
    this.rect = null;
  }

  destroy(): void {
    this.svg.removeEventListener('mousedown', this.onDown);
    this.svg.removeEventListener('mousemove', this.onMove);
    this.win?.removeEventListener('mouseup', this.onUp);
    this.clear();
  }
}
