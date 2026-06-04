import type { ResolvedTheme } from '../theme.js';

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

export interface LegendItem {
  name: string;
  color: string;
  hidden: boolean;
}

const ROW = (vertical: boolean) =>
  `display:flex; gap:14px; flex-wrap:wrap; padding:8px 4px; font-size:12px;
   font-family:system-ui,sans-serif; ${vertical ? 'flex-direction:column;' : ''}
   justify-content:center;`;

/** Interactive HTML legend; clicking an item toggles its series. */
export class Legend {
  readonly el: HTMLElement;

  constructor(
    container: HTMLElement,
    readonly position: LegendPosition,
    theme: ResolvedTheme,
    private readonly onToggle: (index: number) => void,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'vitecharts-legend';
    this.el.setAttribute('style', ROW(position === 'left' || position === 'right'));
    this.el.style.color = theme.labelColor;
    if (position === 'top') container.prepend(this.el);
    else container.appendChild(this.el);
  }

  setItems(items: LegendItem[]): void {
    this.el.replaceChildren(
      ...items.map((item, i) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.setAttribute(
          'style',
          `display:inline-flex; align-items:center; gap:6px; cursor:pointer;
           background:none; border:none; padding:2px 4px; font:inherit; color:inherit;
           opacity:${item.hidden ? 0.4 : 1};`,
        );
        chip.innerHTML = `<span style="width:10px;height:10px;border-radius:2px;
          background:${item.color};display:inline-block"></span><span>${item.name}</span>`;
        chip.addEventListener('click', () => this.onToggle(i));
        return chip;
      }),
    );
  }

  destroy(): void {
    this.el.remove();
  }
}
