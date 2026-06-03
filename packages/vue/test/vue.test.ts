import { describe, expect, it } from 'vitest';
import { createApp, nextTick } from 'vue';
import { ViteChart } from '../src/index.js';

const options = {
  type: 'line' as const,
  data: [
    { m: 'A', v: 1 },
    { m: 'B', v: 3 },
  ],
  x: 'm',
  series: [{ y: 'v' }],
  width: 400,
  animate: false as const,
};

function mountApp(props: { options: typeof options }): { host: HTMLElement; unmount: () => void } {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const app = createApp(ViteChart, props);
  app.mount(host);
  return { host, unmount: () => app.unmount() };
}

describe('ViteChart (vue)', () => {
  it('renders an svg on mount', async () => {
    const { host, unmount } = mountApp({ options });
    await nextTick();
    expect(host.querySelector('svg')).not.toBeNull();
    unmount();
  });

  it('tears down the chart on unmount', async () => {
    const { host, unmount } = mountApp({ options });
    await nextTick();
    unmount();
    expect(host.querySelector('svg')).toBeNull();
  });
});
