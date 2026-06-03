<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useData } from 'vitepress';
import { Chart } from '@vitecharts/core';

const { isDark } = useData();
const el = ref(null);
let chart = null;

const cfg = reactive({ duration: 900, stagger: 140, easing: 'easeOutBack' });
const easings = [
  'linear',
  'easeOutQuad',
  'easeOutCubic',
  'easeInOutCubic',
  'easeOutQuart',
  'easeOutBack',
  'easeOutElastic',
];

const data = [
  { q: 'Q1', v: 34 },
  { q: 'Q2', v: 52 },
  { q: 'Q3', v: 41 },
  { q: 'Q4', v: 67 },
  { q: 'Q5', v: 58 },
];

function build() {
  return {
    type: 'bar',
    data,
    x: 'q',
    series: [{ y: 'v', name: 'Value' }],
    theme: isDark.value ? 'dark' : 'light',
    animate: { duration: cfg.duration, stagger: cfg.stagger, easing: cfg.easing },
  };
}

function replay() {
  if (chart) chart.destroy();
  chart = new Chart(el.value, build());
}

onMounted(replay);
onBeforeUnmount(() => chart && chart.destroy());
</script>

<template>
  <div class="vc-demo">
    <p class="vc-demo-title">Animation playground</p>
    <p class="vc-demo-caption">
      Tweak the timing, then replay — the same `animate` object you pass to any chart.
    </p>
    <div ref="el" style="height: 240px" />
    <div class="vc-controls">
      <label
        >Duration
        <input type="range" min="200" max="2000" step="50" v-model.number="cfg.duration" /><b
          >{{ cfg.duration }}ms</b
        ></label
      >
      <label
        >Stagger <input type="range" min="0" max="400" step="20" v-model.number="cfg.stagger" /><b
          >{{ cfg.stagger }}ms</b
        ></label
      >
      <label
        >Easing
        <select v-model="cfg.easing">
          <option v-for="e in easings" :key="e" :value="e">{{ e }}</option>
        </select></label
      >
      <button class="vc-btn" @click="replay">Replay ▶</button>
    </div>
  </div>
</template>

<style scoped>
.vc-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.vc-controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.vc-controls b {
  color: var(--vp-c-text-1);
  min-width: 48px;
}
.vc-controls input[type='range'] {
  accent-color: var(--vp-c-brand-1);
}
.vc-controls select {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 3px 6px;
  color: inherit;
}
.vc-controls .vc-btn {
  margin-top: 0;
}
</style>
