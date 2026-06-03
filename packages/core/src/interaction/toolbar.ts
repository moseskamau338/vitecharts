import type { ResolvedTheme } from '../theme.js';

export type ExportFormat = 'svg' | 'png' | 'csv' | 'json';

export interface ToolbarActions {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  download: (format: ExportFormat) => void;
  /** Whether zoom buttons should show (numeric x only). */
  zoomable: boolean;
}

const ICONS = {
  zoomIn: 'M7 1v12M1 7h12',
  zoomOut: 'M1 7h12',
  reset: 'M3 7a4 4 0 1 1 1.2 2.8M3 7V4M3 7h3',
  menu: 'M1 3h12M1 7h12M1 11h12',
};

function icon(path: string): string {
  return `<svg width="14" height="14" viewBox="-1 -1 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="${path}"/></svg>`;
}

/** Floating toolbar (top-right): zoom controls + an export menu. */
export class Toolbar {
  readonly el: HTMLElement;
  private menu: HTMLElement | null = null;

  constructor(container: HTMLElement, theme: ResolvedTheme, actions: ToolbarActions) {
    this.el = document.createElement('div');
    this.el.className = 'vitecharts-toolbar';
    this.el.setAttribute(
      'style',
      `position:absolute; top:8px; right:8px; display:flex; gap:4px; z-index:9;
       color:${theme.labelColor}; font-family:${theme.fontFamily};`,
    );

    const button = (title: string, html: string, onClick: () => void): HTMLButtonElement => {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = title;
      b.innerHTML = html;
      b.setAttribute(
        'style',
        `width:26px; height:26px; display:inline-flex; align-items:center; justify-content:center;
         border:1px solid ${theme.axisColor}; border-radius:6px; background:${theme.background};
         color:inherit; cursor:pointer; padding:0;`,
      );
      b.addEventListener('click', onClick);
      return b;
    };

    if (actions.zoomable) {
      this.el.append(
        button('Zoom in', icon(ICONS.zoomIn), actions.zoomIn),
        button('Zoom out', icon(ICONS.zoomOut), actions.zoomOut),
        button('Reset zoom', icon(ICONS.reset), actions.reset),
      );
    }

    const menuBtn = button('Export', icon(ICONS.menu), () => this.toggleMenu(theme, actions));
    this.el.append(menuBtn);
    container.appendChild(this.el);
  }

  private toggleMenu(theme: ResolvedTheme, actions: ToolbarActions): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
      return;
    }
    const menu = document.createElement('div');
    menu.setAttribute(
      'style',
      `position:absolute; top:30px; right:0; background:${theme.background};
       border:1px solid ${theme.axisColor}; border-radius:8px; padding:4px;
       box-shadow:0 4px 14px rgba(0,0,0,.12); display:flex; flex-direction:column; min-width:120px;`,
    );
    (['svg', 'png', 'csv', 'json'] as ExportFormat[]).forEach((fmt) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.textContent = `Download ${fmt.toUpperCase()}`;
      item.setAttribute(
        'style',
        `text-align:left; padding:6px 10px; border:none; background:none; color:inherit;
         cursor:pointer; font:inherit; border-radius:5px;`,
      );
      item.addEventListener('click', () => {
        actions.download(fmt);
        this.toggleMenu(theme, actions);
      });
      menu.appendChild(item);
    });
    this.menu = menu;
    this.el.appendChild(menu);
  }

  destroy(): void {
    this.el.remove();
  }
}
