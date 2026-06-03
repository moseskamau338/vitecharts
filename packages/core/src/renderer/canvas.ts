import type { Attrs, NodeHandle, Renderer } from './types.js';

/**
 * Experimental Canvas backend (Phase 1 stub).
 *
 * Canvas is immediate-mode, so primitive factories draw straight away and return
 * a no-op handle (there are no retained nodes to mutate). This works with the
 * engine's clear-and-redraw model. The full retained/animatable Canvas backend
 * lands in Phase 9; for now this exists to lock in the DPR-aware sizing contract
 * and prove the {@link Renderer} interface is backend-agnostic.
 */
const NOOP: NodeHandle = {
  set: () => NOOP,
  text: () => NOOP,
  remove: () => {},
};

function num(attrs: Attrs | undefined, key: string, fallback = 0): number {
  const v = attrs?.[key];
  return typeof v === 'number' ? v : fallback;
}

export class CanvasRenderer implements Renderer {
  readonly mount: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly dpr: number;
  private cssWidth = 0;
  private cssHeight = 0;

  constructor(container: HTMLElement, dpr: number = globalThis.devicePixelRatio || 1) {
    this.mount = document.createElement('canvas');
    this.mount.style.display = 'block';
    this.mount.className = 'vitecharts-canvas';
    container.appendChild(this.mount);
    this.ctx = this.mount.getContext('2d');
    this.dpr = dpr;
  }

  resize(width: number, height: number): void {
    this.cssWidth = width;
    this.cssHeight = height;
    this.mount.style.width = `${width}px`;
    this.mount.style.height = `${height}px`;
    this.mount.width = Math.round(width * this.dpr);
    this.mount.height = Math.round(height * this.dpr);
    // Draw in CSS pixels; the transform handles the device-pixel upscale.
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear(): void {
    this.ctx?.clearRect(0, 0, this.cssWidth, this.cssHeight);
  }

  group(): NodeHandle {
    return NOOP;
  }

  path(attrs?: Attrs): NodeHandle {
    const d = attrs?.['d'];
    if (this.ctx && typeof d === 'string' && typeof Path2D !== 'undefined') {
      const p = new Path2D(d);
      const stroke = attrs?.['stroke'];
      const fill = attrs?.['fill'];
      if (typeof fill === 'string' && fill !== 'none') {
        this.ctx.fillStyle = fill;
        this.ctx.fill(p);
      }
      if (typeof stroke === 'string' && stroke !== 'none') {
        this.ctx.strokeStyle = stroke;
        this.ctx.lineWidth = num(attrs, 'stroke-width', 1);
        this.ctx.stroke(p);
      }
    }
    return NOOP;
  }

  line(attrs?: Attrs): NodeHandle {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(num(attrs, 'x1'), num(attrs, 'y1'));
      this.ctx.lineTo(num(attrs, 'x2'), num(attrs, 'y2'));
      this.ctx.strokeStyle = String(attrs?.['stroke'] ?? '#000');
      this.ctx.lineWidth = num(attrs, 'stroke-width', 1);
      this.ctx.stroke();
    }
    return NOOP;
  }

  rect(attrs?: Attrs): NodeHandle {
    if (this.ctx) {
      this.ctx.fillStyle = String(attrs?.['fill'] ?? '#000');
      this.ctx.fillRect(
        num(attrs, 'x'),
        num(attrs, 'y'),
        num(attrs, 'width'),
        num(attrs, 'height'),
      );
    }
    return NOOP;
  }

  circle(attrs?: Attrs): NodeHandle {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.arc(num(attrs, 'cx'), num(attrs, 'cy'), num(attrs, 'r', 1), 0, Math.PI * 2);
      this.ctx.fillStyle = String(attrs?.['fill'] ?? '#000');
      this.ctx.fill();
    }
    return NOOP;
  }

  text(content: string, attrs?: Attrs): NodeHandle {
    if (this.ctx) {
      this.ctx.fillStyle = String(attrs?.['fill'] ?? '#000');
      this.ctx.fillText(content, num(attrs, 'x'), num(attrs, 'y'));
    }
    return NOOP;
  }

  destroy(): void {
    this.mount.remove();
  }
}
