<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Chart } from '@vitecharts/core';

const props = defineProps({
  options: { type: Object, required: true },
  height: { type: Number, default: 320 },
});

const el = ref(null);
let chart = null;

onMounted(() => {
  chart = new Chart(el.value, { ...props.options });
});

watch(
  () => props.options,
  (next) => chart && chart.update({ ...next }),
  { deep: true },
);

onBeforeUnmount(() => chart && chart.destroy());
</script>

<template>
  <ClientOnly>
    <div class="vc-demo">
      <div ref="el" class="vc-demo-canvas" :style="{ height: height + 'px' }" />
    </div>
  </ClientOnly>
</template>

<style scoped>
.vc-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 18px 0;
  background: var(--vp-c-bg);
}
.vc-demo-canvas {
  width: 100%;
}
</style>
