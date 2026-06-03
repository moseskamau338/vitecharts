export type Range = [number, number];

export interface ZoomDeps {
  /** Plot bounds in pixels (from the interaction model). */
  bounds: () => { left: number; right: number } | null;
  /** Current data-space x window, or null when unzoomed. */
  window: () => Range | null;
  /** Full data-space x extent, or null for non-numeric x (zoom disabled). */
  extent: () => Range | null;
  /** Apply a new window. */
  onChange: (window: Range) => void;
  /** Whether drag should pan. */
  panEnabled: () => boolean;
}

const MIN_SPAN_FRACTION = 0.02;

function clamp(a: number, b: number, [e0, e1]: Range): Range {
  let span = Math.min(b - a, e1 - e0);
  span = Math.max(span, (e1 - e0) * MIN_SPAN_FRACTION);
  let lo = a;
  let hi = a + span;
  if (lo < e0) {
    lo = e0;
    hi = e0 + span;
  }
  if (hi > e1) {
    hi = e1;
    lo = e1 - span;
  }
  return [lo, hi];
}

/**
 * Wheel-zoom and drag-pan over a cartesian chart's x axis (numeric/time only).
 * Reports a new data-space window; the Chart applies it via `axes.x.min/max`.
 */
export class ZoomController {
  private dragging = false;
  private lastX = 0;

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly deps: ZoomDeps,
  ) {
    svg.addEventListener('wheel', this.onWheel, { passive: false });
    svg.addEventListener('mousedown', this.onDown);
    svg.addEventListener('mousemove', this.onMove);
    this.win?.addEventListener('mouseup', this.onUp);
  }

  private get win(): Window | null {
    return this.svg.ownerDocument?.defaultView ?? null;
  }

  private current(): Range | null {
    return this.deps.window() ?? this.deps.extent();
  }

  private fracAt(clientX: number): number {
    const b = this.deps.bounds();
    if (!b) return 0.5;
    const x = clientX - this.svg.getBoundingClientRect().left;
    return Math.max(0, Math.min(1, (x - b.left) / (b.right - b.left)));
  }

  private onWheel = (e: WheelEvent): void => {
    const extent = this.deps.extent();
    const cur = this.current();
    if (!extent || !cur) return;
    e.preventDefault();
    const [w0, w1] = cur;
    const center = w0 + this.fracAt(e.clientX) * (w1 - w0);
    const factor = e.deltaY < 0 ? 0.82 : 1 / 0.82; // in / out
    this.deps.onChange(
      clamp(center - (center - w0) * factor, center + (w1 - center) * factor, extent),
    );
  };

  private onDown = (e: MouseEvent): void => {
    if (!this.deps.panEnabled()) return;
    this.dragging = true;
    this.lastX = e.clientX;
  };

  private onMove = (e: MouseEvent): void => {
    if (!this.dragging) return;
    const extent = this.deps.extent();
    const cur = this.current();
    const b = this.deps.bounds();
    if (!extent || !cur || !b) return;
    const dxPx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    const span = cur[1] - cur[0];
    const dData = -(dxPx / (b.right - b.left)) * span;
    this.deps.onChange(clamp(cur[0] + dData, cur[1] + dData, extent));
  };

  private onUp = (): void => {
    this.dragging = false;
  };

  destroy(): void {
    this.svg.removeEventListener('wheel', this.onWheel);
    this.svg.removeEventListener('mousedown', this.onDown);
    this.svg.removeEventListener('mousemove', this.onMove);
    this.win?.removeEventListener('mouseup', this.onUp);
  }
}
