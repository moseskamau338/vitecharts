import { Chart, type ChartOptions } from '@vitecharts/core';

/**
 * `<vitecharts-chart>` custom element. Set its `options` property to a
 * {@link ChartOptions} object; updating the property re-renders in place.
 *
 * ```html
 * <vitecharts-chart id="c"></vitecharts-chart>
 * <script type="module">
 *   import '@vitecharts/wc';
 *   document.getElementById('c').options = { type: 'line', data, x: 'm', series: [{ y: 'v' }] };
 * </script>
 * ```
 */
export class ViteChartElement extends HTMLElement {
  private chart: Chart | null = null;
  private current: ChartOptions | null = null;

  /** The chart configuration. Assigning re-renders the chart. */
  get options(): ChartOptions | null {
    return this.current;
  }

  set options(value: ChartOptions | null) {
    this.current = value;
    this.render();
  }

  /** Access the underlying imperative chart instance. */
  get chartInstance(): Chart | null {
    return this.chart;
  }

  connectedCallback(): void {
    if (this.style.display === '') this.style.display = 'block';
    this.render();
  }

  disconnectedCallback(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private render(): void {
    if (!this.isConnected || !this.current) return;
    if (this.chart) {
      this.chart.update(this.current);
    } else {
      this.chart = new Chart(this, this.current);
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('vitecharts-chart')) {
  customElements.define('vitecharts-chart', ViteChartElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'vitecharts-chart': ViteChartElement;
  }
}
