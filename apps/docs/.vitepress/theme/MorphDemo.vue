<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import { Chart } from '@vitecharts/core';

const { isDark } = useData();
const el = ref(null);
let chart = null;
const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

function randomData() {
  return labels.map((q) => ({ q, v: 20 + Math.round(Math.random() * 80) }));
}

function shuffle() {
  chart.setData(randomData());
}

onMounted(() => {
  chart = new Chart(el.value, {
    type: 'bar',
    data: randomData(),
    x: 'q',
    series: [{ y: 'v', name: 'Value' }],
    dataLabels: true,
    theme: 'css',
    animate: 'apex',
  });
});
watch(isDark, () => chart && chart.update({}));
onBeforeUnmount(() => chart && chart.destroy());
</script>

<template>
  <div class="vc-demo">
    <div ref="el" class="vc-demo-canvas" style="height: 300px" />
    <button class="vc-btn" @click="shuffle">Shuffle data → watch the bars morph</button>
  </div>
</template>

<style scoped>
.vc-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 18px 0;
}
.vc-btn {
  margin-top: 10px;
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
