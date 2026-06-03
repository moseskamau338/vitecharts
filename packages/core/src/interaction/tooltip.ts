import type { ResolvedTheme } from '../theme.js';
import type { TooltipRenderer, XGroup } from './types.js';

function escape(value: unknown): string {
  return String(value).replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;',
  );
}

function defaultRenderer(): TooltipRenderer {
  return (group: XGroup) => {
    const rows = group.points
      .map(
        (p) => `
        <div class="vc-tt-row">
          <span class="vc-tt-dot" style="background:${p.color}"></span>
          <span class="vc-tt-name">${escape(p.name)}</span>
          <span class="vc-tt-val">${escape(p.value)}</span>
        </div>`,
      )
      .join('');
    return `<div class="vc-tt-title">${escape(group.xRaw)}</div>${rows}`;
  };
}

const STYLE = `
position:absolute; pointer-events:none; z-index:10;
background:#fff; border:1px solid #e3e6ea; border-radius:8px;
box-shadow:0 4px 14px rgba(0,0,0,.1); padding:8px 10px; font-size:12px;
font-family:system-ui,sans-serif; color:#111827; opacity:0;
transition:opacity .12s ease, transform .12s ease; transform:translateY(4px);
white-space:nowrap;`;

/** Floating HTML tooltip positioned over the chart container. */
export class Tooltip {
  readonly el: HTMLElement;
  private readonly render: TooltipRenderer;

  constructor(container: HTMLElement, theme: ResolvedTheme, custom?: TooltipRenderer) {
    this.render = custom ?? defaultRenderer();
    this.el = document.createElement('div');
    this.el.className = 'vitecharts-tooltip';
    this.el.setAttribute('style', STYLE);
    if (theme.background !== '#ffffff') {
      this.el.style.background = theme.background;
      this.el.style.color = theme.labelColor;
    }
    container.appendChild(this.el);
  }

  show(group: XGroup, x: number, y: number): void {
    this.el.innerHTML = this.render(group);
    this.el.style.opacity = '1';
    this.el.style.transform = 'translateY(0)';
    // Position above-right of the anchor, clamped within the container.
    const rect = this.el.getBoundingClientRect();
    const offset = 12;
    this.el.style.left = `${x + offset}px`;
    this.el.style.top = `${Math.max(0, y - rect.height - offset)}px`;
  }

  hide(): void {
    this.el.style.opacity = '0';
    this.el.style.transform = 'translateY(4px)';
  }

  destroy(): void {
    this.el.remove();
  }
}
