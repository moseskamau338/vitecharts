<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Chart } from '@vitecharts/core';

const overview = ref(null);
const detail = ref(null);
let oChart = null;
let dChart = null;

const data = Array.from({ length: 60 }, (_, i) => ({
  t: i,
  v: 50 + Math.sin(i / 5) * 25 + Math.cos(i / 2) * 8,
}));

onMounted(() => {
  dChart = new Chart(detail.value, {
    type: 'area',
    data,
    x: 't',
    series: [{ y: 'v', name: 'Value', curve: 'smooth' }],
    animate: false,
  });
  oChart = new Chart(overview.value, {
    type: 'line',
    data,
    x: 't',
    series: [{ y: 'v', curve: 'smooth' }],
    brush: true,
    tooltip: false,
    height: 90,
    animate: false,
  });
  oChart.on('brushSelection', ({ x0, x1 }) => {
    dChart.update({ axes: { x: { min: Number(x0), max: Number(x1) } } });
  });
});

onBeforeUnmount(() => {
  oChart && oChart.destroy();
  dChart && dChart.destroy();
});
</script>

<template>
  <ClientOnly>
    <div class="vc-demo">
      <div ref="detail" style="height: 260px" />
      <p class="vc-hint">Drag across the overview below to zoom the detail chart above.</p>
      <div ref="overview" style="height: 90px" />
    </div>
  </ClientOnly>
</template>

<style scoped>
.vc-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 18px 0;
}
.vc-hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin: 6px 0;
}
</style>
