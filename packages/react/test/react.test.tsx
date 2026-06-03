import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Chart } from '../src/index.js';

afterEach(cleanup);

const data = [
  { m: 'A', v: 1 },
  { m: 'B', v: 3 },
];

describe('<Chart /> (react)', () => {
  it('renders an svg surface', () => {
    const { container } = render(
      <Chart type="line" data={data} x="m" series={[{ y: 'v' }]} width={400} animate={false} />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('re-renders when props change', () => {
    const { container, rerender } = render(
      <Chart type="line" data={data} x="m" series={[{ y: 'v' }]} width={400} animate={false} />,
    );
    rerender(
      <Chart
        type="line"
        data={data}
        x="m"
        series={[{ y: 'v' }, { y: 'm' }]}
        width={400}
        animate={false}
      />,
    );
    expect(container.querySelectorAll('.vitecharts-series path').length).toBe(2);
  });

  it('exposes the imperative instance via ref', () => {
    let handle: { toCSV(): string } | null = null;
    render(
      <Chart
        ref={(h) => {
          handle = h;
        }}
        type="line"
        data={data}
        x="m"
        series={[{ y: 'v' }]}
        width={400}
        animate={false}
      />,
    );
    expect(handle).not.toBeNull();
    expect(typeof handle!.toCSV()).toBe('string');
  });
});
