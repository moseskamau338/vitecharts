<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Chart } from '@vitecharts/core';

const a = ref(null);
const b = ref(null);
let ca = null;
let cb = null;

const data = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}:00`,
  cpu: 30 + Math.sin(i / 2) * 20,
  mem: 50 + Math.cos(i / 3) * 15,
}));

onMounted(() => {
  ca = new Chart(a.value, {
    type: 'line',
    data,
    x: 'h',
    series: [{ y: 'cpu', name: 'CPU %', curve: 'smooth' }],
    group: 'metrics',
    animate: false,
  });
  cb = new Chart(b.value, {
    type: 'area',
    data,
    x: 'h',
    series: [{ y: 'mem', name: 'Memory %', curve: 'smooth' }],
    group: 'metrics',
    animate: false,
  });
});

onBeforeUnmount(() => {
  ca && ca.destroy();
  cb && cb.destroy();
});
</script>

<template>
  <ClientOnly>
    <div class="vc-demo">
      <p class="vc-hint">Hover either chart — the crosshair mirrors across both (shared group).</p>
      <div ref="a" style="height: 200px" />
      <div ref="b" style="height: 200px" />
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
  margin: 0 0 8px;
}
</style>
