import type { Emitter } from '../events.js';
import type { ResolvedTheme } from '../theme.js';
import type { Tooltip } from './tooltip.js';
import type { ChartEventMap, InteractionModel, XGroup } from './types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface ControllerOptions {
  crosshair: boolean;
  theme: ResolvedTheme;
}

/**
 * Wires pointer interaction to a chart's SVG surface: nearest-x hit testing,
 * a crosshair line, the floating tooltip, and `pointerMove`/`markerClick` events.
 * Listeners are attached once to the persistent svg root; only the model changes
 * between redraws.
 */
export class InteractionController {
  private model: InteractionModel | null = null;
  private crosshairEl: SVGLineElement | null = null;
  private emphasisEls: SVGCircleElement[] = [];

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly tooltip: Tooltip | null,
    private readonly emitter: Emitter<ChartEventMap>,
    private readonly opts: ControllerOptions,
  ) {
    this.svg.addEventListener('mousemove', this.onMove);
    this.svg.addEventListener('mouseleave', this.onLeave);
    this.svg.addEventListener('click', this.onClick);
  }

  setModel(model: InteractionModel): void {
    this.model = model;
    this.removeCrosshair();
    this.clearEmphasis();
  }

  /** Find a group by its raw x value (for synced charts). */
  findByXRaw(xRaw: unknown): XGroup | null {
    return this.model?.groups.find((g) => String(g.xRaw) === String(xRaw)) ?? null;
  }

  /** Programmatically show the crosshair + tooltip for a group (sync peers). */
  showGroup(group: XGroup): void {
    if (this.opts.crosshair) this.drawCrosshair(group.x);
    this.emphasize(group);
    const topY = Math.min(...group.points.map((p) => p.cy));
    this.tooltip?.show(group, group.x, topY);
  }

  /** Hide crosshair + tooltip without emitting events (sync peers). */
  hide(): void {
    this.removeCrosshair();
    this.clearEmphasis();
    this.tooltip?.hide();
  }

  /** Highlight the hovered points with a ring (cleared on the next move/leave). */
  private emphasize(group: XGroup): void {
    this.clearEmphasis();
    for (const p of group.points) {
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('class', 'vitecharts-emphasis');
      ring.setAttribute('cx', String(p.cx));
      ring.setAttribute('cy', String(p.cy));
      ring.setAttribute('r', '5');
      ring.setAttribute('fill', '#ffffff');
      ring.setAttribute('stroke', p.color);
      ring.setAttribute('stroke-width', '2.5');
      ring.setAttribute('pointer-events', 'none');
      this.svg.appendChild(ring);
      this.emphasisEls.push(ring);
    }
  }

  private clearEmphasis(): void {
    for (const el of this.emphasisEls) el.remove();
    this.emphasisEls = [];
  }

  private localPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private nearest(x: number): XGroup | null {
    if (!this.model || this.model.groups.length === 0) return null;
    const { left, right } = this.model.bounds;
    if (x < left - 8 || x > right + 8) return null;
    let best: XGroup | null = null;
    let bestDist = Infinity;
    for (const g of this.model.groups) {
      const d = Math.abs(g.x - x);
      if (d < bestDist) {
        bestDist = d;
        best = g;
      }
    }
    return best;
  }

  private onMove = (e: MouseEvent): void => {
    const { x, y } = this.localPos(e);
    const group = this.nearest(x);
    if (!group) {
      this.onLeave();
      return;
    }
    if (this.opts.crosshair) this.drawCrosshair(group.x);
    this.emphasize(group);
    const topY = Math.min(...group.points.map((p) => p.cy));
    this.tooltip?.show(group, group.x, topY);
    this.emitter.emit('pointerMove', { group, x: group.x, y: topY });
    void y;
  };

  private onLeave = (): void => {
    this.removeCrosshair();
    this.clearEmphasis();
    this.tooltip?.hide();
    this.emitter.emit('pointerLeave', undefined);
  };

  private onClick = (e: MouseEvent): void => {
    const group = this.nearest(this.localPos(e).x);
    const point = group?.points[0];
    if (point) this.emitter.emit('markerClick', { point });
  };

  private drawCrosshair(x: number): void {
    if (!this.model) return;
    const { top, bottom } = this.model.bounds;
    if (!this.crosshairEl) {
      this.crosshairEl = document.createElementNS(SVG_NS, 'line');
      this.crosshairEl.setAttribute('class', 'vitecharts-crosshair');
      this.crosshairEl.setAttribute('stroke', this.opts.theme.labelColor);
      this.crosshairEl.setAttribute('stroke-dasharray', '3 3');
      this.crosshairEl.setAttribute('stroke-opacity', '0.5');
      this.crosshairEl.setAttribute('pointer-events', 'none');
      this.svg.appendChild(this.crosshairEl);
    }
    this.crosshairEl.setAttribute('x1', String(x));
    this.crosshairEl.setAttribute('x2', String(x));
    this.crosshairEl.setAttribute('y1', String(top));
    this.crosshairEl.setAttribute('y2', String(bottom));
  }

  private removeCrosshair(): void {
    this.crosshairEl?.remove();
    this.crosshairEl = null;
  }

  destroy(): void {
    this.svg.removeEventListener('mousemove', this.onMove);
    this.svg.removeEventListener('mouseleave', this.onLeave);
    this.svg.removeEventListener('click', this.onClick);
    this.removeCrosshair();
  }
}
