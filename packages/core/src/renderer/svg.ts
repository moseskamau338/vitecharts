import type { Attrs, NodeHandle, Renderer } from './types.js';

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
