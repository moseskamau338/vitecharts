import { Chart as Core, type ChartOptions } from '@vitecharts/core';
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue';

/**
 * Vue 3 component wrapping the imperative ViteCharts `Chart`. Pass the config as
 * the `options` prop; deep changes re-render in place.
 *
 * ```vue
 * <ViteChart :options="{ type: 'line', data, x: 'm', series: [{ y: 'v' }] }" />
 * ```
 */
export const ViteChart = defineComponent({
  name: 'ViteChart',
  props: {
    options: { type: Object as PropType<ChartOptions>, required: true },
  },
  setup(props) {
    const host = ref<HTMLDivElement | null>(null);
    let chart: Core | null = null;

    onMounted(() => {
      if (host.value) chart = new Core(host.value, props.options);
    });

    watch(
      () => props.options,
      (next) => chart?.update(next),
      { deep: true },
    );

    onBeforeUnmount(() => {
      chart?.destroy();
      chart = null;
    });

    return () => h('div', { ref: host });
  },
});

export default ViteChart;
