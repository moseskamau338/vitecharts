import { Chart as Core, type ChartOptions } from '@vitecharts/core';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from 'react';

export type ChartProps = ChartOptions & {
  className?: string;
  style?: CSSProperties;
};

export type ChartHandle = Core;

/**
 * React wrapper around the imperative ViteCharts `Chart`. Creates the chart once
 * on mount, applies option changes on re-render, and exposes the underlying
 * instance through a ref.
 *
 * ```tsx
 * <Chart type="bar" data={data} x="month" series={[{ y: 'units' }]} animate="apex" />
 * ```
 */
export const Chart = forwardRef<ChartHandle, ChartProps>(function Chart(props, ref) {
  const { className, style, ...options } = props;
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Core | null>(null);

  // Layout effect so the instance exists before useImperativeHandle commits.
  useLayoutEffect(() => {
    if (!elRef.current) return;
    const chart = new Core(elRef.current, options as ChartOptions);
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
    // Create once; subsequent option changes flow through the update effect.
  }, []);

  useEffect(() => {
    chartRef.current?.update(options as ChartOptions);
  });

  useImperativeHandle(ref, () => chartRef.current as Core, []);

  return <div ref={elRef} className={className} style={style} />;
});
