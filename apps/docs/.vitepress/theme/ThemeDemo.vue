<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Chart } from '@vitecharts/core';

const el = ref(null);
let chart = null;
const dark = ref(false);

const data = [
  { q: 'Q1', a: 44, b: 13 },
  { q: 'Q2', a: 55, b: 23 },
  { q: 'Q3', a: 41, b: 20 },
  { q: 'Q4', a: 67, b: 8 },
];

function build() {
  return {
    type: 'bar',
    data,
    x: 'q',
    series: [
      { y: 'a', name: 'Revenue' },
      { y: 'b', name: 'Cost' },
    ],
    theme: dark.value ? 'dark' : 'light',
    animate: 'apex',
    legend: true,
  };
}

function toggle() {
  dark.value = !dark.value;
  chart.update(build());
}

onMounted(() => {
  chart = new Chart(el.value, build());
});
onBeforeUnmount(() => chart && chart.destroy());
</script>

<template>
  <div class="vc-demo" :class="{ dark }">
    <div ref="el" class="vc-demo-canvas" style="height: 300px" />
    <button class="vc-btn" @click="toggle">Switch to {{ dark ? 'light' : 'dark' }}</button>
  </div>
</template>

<style scoped>
.vc-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 18px 0;
  transition: background 0.2s;
}
.vc-demo.dark {
  background: #1a1b26;
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
</style>
