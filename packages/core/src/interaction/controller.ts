import type { Emitter } from '../events.js';
import type { ResolvedTheme } from '../theme.js';
import type { Tooltip } from './tooltip.js';
import type { ChartEventMap, InteractionModel, XGroup } from './types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Cursor (crosshair + emphasis) glide timing — a gentle ease-out so the line
// and rings follow the pointer with momentum rather than snapping.
const CURSOR_MS = 140;
const CURSOR_BEZIER = 'cubic-bezier(0.22, 1, 0.36, 1)';
const CURSOR_EASE = `transform ${CURSOR_MS}ms ${CURSOR_BEZIER}`;

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
    // The previous overlay nodes were detached by the renderer's clear().
    this.crosshairEl = null;
    this.emphasisEls = [];
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

  /**
   * Highlight the hovered points with a ring. Rings are pooled and moved via a
   * CSS `transform` transition so they glide between points rather than snap.
   */
  private emphasize(group: XGroup): void {
    const n = group.points.length;
    while (this.emphasisEls.length < n) {
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('class', 'vitecharts-emphasis');
      ring.setAttribute('r', '4.5');
      ring.setAttribute('fill', '#ffffff');
      ring.setAttribute('stroke-width', '2.5');
      ring.setAttribute('pointer-events', 'none');
      ring.style.opacity = '0';
      this.svg.appendChild(ring);
      this.emphasisEls.push(ring);
    }
    group.points.forEach((p, i) => {
      const ring = this.emphasisEls[i]!;
      const firstShow = ring.style.opacity !== '1';
      ring.setAttribute('stroke', p.color);
      ring.style.transform = `translate(${p.cx}px, ${p.cy}px)`;
      // Enable the transition only after the initial placement so a freshly
      // shown ring fades in (opacity) without sliding from the origin.
      if (firstShow) {
        ring.style.transition = `${CURSOR_EASE}, opacity 120ms ease`;
      }
      ring.style.opacity = '1';
    });
    for (let i = n; i < this.emphasisEls.length; i++) this.emphasisEls[i]!.style.opacity = '0';
  }

  private clearEmphasis(): void {
    for (const el of this.emphasisEls) el.style.opacity = '0';
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
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('class', 'vitecharts-crosshair');
      line.setAttribute('x1', '0');
      line.setAttribute('x2', '0');
      line.setAttribute('y1', String(top));
      line.setAttribute('y2', String(bottom));
      line.setAttribute('stroke', this.opts.theme.labelColor);
      line.setAttribute('stroke-dasharray', '3 4');
      line.setAttribute('stroke-opacity', '0.45');
      line.setAttribute('pointer-events', 'none');
      line.style.transform = `translateX(${x}px)`;
      this.svg.appendChild(line);
      // Enable the slide transition after the first placement (no slide-in).
      line.style.transition = `transform ${CURSOR_MS}ms ${CURSOR_BEZIER}`;
      this.crosshairEl = line;
    } else {
      this.crosshairEl.setAttribute('y1', String(top));
      this.crosshairEl.setAttribute('y2', String(bottom));
      this.crosshairEl.style.transform = `translateX(${x}px)`;
    }
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
