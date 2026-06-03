<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import { Chart } from '@vitecharts/core';

const props = defineProps({
  options: { type: Object, required: true },
  height: { type: Number, default: 320 },
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
});

const { isDark } = useData();
const el = ref(null);
let chart = null;

function withTheme(opts) {
  // Respect an explicit theme; otherwise follow the page (light/dark).
  return opts.theme ? opts : { ...opts, theme: isDark.value ? 'dark' : 'light' };
}

onMounted(() => {
  chart = new Chart(el.value, withTheme({ ...props.options }));
});

watch(
  () => props.options,
  (next) => chart && chart.update(withTheme({ ...next })),
  { deep: true },
);

watch(isDark, () => {
  if (chart && !props.options.theme) chart.update({ theme: isDark.value ? 'dark' : 'light' });
});

onBeforeUnmount(() => chart && chart.destroy());
</script>

<template>
  <div class="vc-demo">
    <p v-if="title" class="vc-demo-title">{{ title }}</p>
    <p v-if="caption" class="vc-demo-caption">{{ caption }}</p>
    <div ref="el" class="vc-demo-canvas" :style="{ height: height + 'px' }" />
  </div>
</template>
