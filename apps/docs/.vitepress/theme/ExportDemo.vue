<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Chart } from '@vitecharts/core';

const el = ref(null);
let chart = null;

onMounted(() => {
  chart = new Chart(el.value, {
    type: 'line',
    data: [
      { m: 'Jan', v: 30 },
      { m: 'Feb', v: 40 },
      { m: 'Mar', v: 35 },
      { m: 'Apr', v: 55 },
      { m: 'May', v: 49 },
      { m: 'Jun', v: 70 },
    ],
    x: 'm',
    series: [{ y: 'v', name: 'Sales', curve: 'smooth' }],
    markers: true,
    animate: 'apex',
  });
});
onBeforeUnmount(() => chart && chart.destroy());
</script>

<template>
  <div class="vc-demo">
    <div ref="el" class="vc-demo-canvas" style="height: 300px" />
    <div class="vc-btns">
      <button class="vc-btn" @click="chart.download('svg')">SVG</button>
      <button class="vc-btn" @click="chart.download('png')">PNG</button>
      <button class="vc-btn" @click="chart.download('csv')">CSV</button>
      <button class="vc-btn" @click="chart.download('json')">JSON</button>
    </div>
  </div>
</template>

<style scoped>
.vc-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 18px 0;
}
.vc-btns {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.vc-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
}
.vc-btn:hover {
  background: var(--vp-c-brand-soft);
}
</style>
