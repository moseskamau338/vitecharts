<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import { Chart } from '@vitecharts/core';
import { galleryItems } from '../data/datasets';

const { isDark } = useData();
const items = galleryItems;
const containers = ref([]);
let charts = [];

const theme = () => (isDark.value ? 'dark' : 'light');

onMounted(() => {
  items.forEach((item, i) => {
    const el = containers.value[i];
    if (el) charts.push(new Chart(el, { ...item.options, theme: theme() }));
  });
});

watch(isDark, () => charts.forEach((c) => c.update({ theme: theme() })));

onBeforeUnmount(() => {
  charts.forEach((c) => c.destroy());
  charts = [];
});
</script>

<template>
  <div class="vc-gallery-page">
    <div class="vc-gallery-head">
      <h1>Gallery</h1>
      <p class="vc-gallery-sub">
        A dozen charts, one core. Every tile is a <strong>live, animated</strong> ViteCharts
        instance that follows the page theme — hover them, toggle dark mode, and watch them
        re-render. A few use real data (currency rates from the Frankfurter API); the rest are
        realistic samples.
      </p>
    </div>
    <div class="vc-gallery">
      <div class="vc-card" v-for="(item, i) in items" :key="i">
        <h3>{{ item.title }}</h3>
        <p>{{ item.caption }}</p>
        <div class="vc-card-canvas" :ref="(el) => (containers[i] = el)" style="height: 220px" />
      </div>
    </div>
  </div>
</template>
