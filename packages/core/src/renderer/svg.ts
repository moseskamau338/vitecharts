import type { Attrs, GradientStop, NodeHandle, Renderer } from './types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

class SvgNode implements NodeHandle {
  constructor(readonly el: SVGElement) {}

  set(attrs: Attrs): this {
    for (const key in attrs) {
      this.el.setAttribute(key, String(attrs[key]));
    }
    return this;
  }

  text(value: string): this {
    this.el.textContent = value;
    return this;
  }

  remove(): void {
    this.el.remove();
  }
}

/** SVG implementation of the {@link Renderer} contract. */
export class SvgRenderer implements Renderer {
  readonly mount: SVGSVGElement;
  private defs: SVGDefsElement | null = null;
  private gradientId = 0;

  constructor(container: HTMLElement) {
    this.mount = document.createElementNS(SVG_NS, 'svg');
    this.mount.style.display = 'block';
    this.mount.setAttribute('class', 'vitecharts-svg');
    container.appendChild(this.mount);
  }

  resize(width: number, height: number): void {
    this.mount.setAttribute('width', String(width));
    this.mount.setAttribute('height', String(height));
    this.mount.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  clear(): void {
    while (this.mount.firstChild) this.mount.removeChild(this.mount.firstChild);
    this.defs = null;
  }

  gradient(stops: GradientStop[], vertical = true): string {
    if (!this.defs) {
      this.defs = document.createElementNS(SVG_NS, 'defs');
      this.mount.insertBefore(this.defs, this.mount.firstChild);
    }
    const id = `vc-grad-${this.gradientId++}`;
    const grad = document.createElementNS(SVG_NS, 'linearGradient');
    grad.setAttribute('id', id);
    grad.setAttribute('x1', '0');
    grad.setAttribute('y1', '0');
    grad.setAttribute('x2', vertical ? '0' : '1');
    grad.setAttribute('y2', vertical ? '1' : '0');
    for (const s of stops) {
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', `${s.offset * 100}%`);
      stop.setAttribute('stop-color', s.color);
      if (s.opacity != null) stop.setAttribute('stop-opacity', String(s.opacity));
      grad.appendChild(stop);
    }
    this.defs.appendChild(grad);
    return `url(#${id})`;
  }

  private create(tag: string, attrs?: Attrs, parent?: NodeHandle): SvgNode {
    const el = document.createElementNS(SVG_NS, tag);
    const node = new SvgNode(el);
    if (attrs) node.set(attrs);
    const host = parent ? (parent as SvgNode).el : this.mount;
    host.appendChild(el);
    return node;
  }

  group(attrs?: Attrs, parent?: NodeHandle): NodeHandle {
    return this.create('g', attrs, parent);
  }

  path(attrs?: Attrs, parent?: NodeHandle): NodeHandle {
    return this.create('path', attrs, parent);
  }

  line(attrs?: Attrs, parent?: NodeHandle): NodeHandle {
    return this.create('line', attrs, parent);
  }

  rect(attrs?: Attrs, parent?: NodeHandle): NodeHandle {
    return this.create('rect', attrs, parent);
  }

  circle(attrs?: Attrs, parent?: NodeHandle): NodeHandle {
    return this.create('circle', attrs, parent);
  }

  text(content: string, attrs?: Attrs, parent?: NodeHandle): NodeHandle {
    return this.create('text', attrs, parent).text(content);
  }

  destroy(): void {
    this.mount.remove();
  }
}
