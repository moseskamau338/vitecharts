<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Chart } from '@vitecharts/core';

const el = ref(null);
let chart = null;
let timer = null;
let t = 0;
const running = ref(false);

function seed() {
  return Array.from({ length: 20 }, (_, i) => ({ t: i, v: 50 + Math.sin(i / 3) * 20 }));
}

function tick() {
  t += 1;
  const data = chart.toJSON ? JSON.parse(chart.toJSON()).data : [];
  const next = [...data.slice(-39), { t: data.length, v: 50 + Math.sin(t / 3) * 20 + (t % 5) * 3 }];
  chart.setData(next);
}

function toggle() {
  running.value = !running.value;
  if (running.value) timer = setInterval(tick, 600);
  else clearInterval(timer);
}

onMounted(() => {
  chart = new Chart(el.value, {
    type: 'area',
    data: seed(),
    x: 't',
    series: [{ y: 'v', name: 'Signal', curve: 'smooth' }],
    animate: 'apex',
    axes: { x: { ticks: 6 } },
  });
});

onBeforeUnmount(() => {
  clearInterval(timer);
  chart && chart.destroy();
});
</script>

<template>
  <div class="vc-demo">
    <div ref="el" class="vc-demo-canvas" style="height: 300px" />
    <button class="vc-btn" @click="toggle">{{ running ? 'Stop' : 'Start' }} streaming</button>
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
