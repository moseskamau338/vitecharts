<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { useData } from 'vitepress';
import { Chart } from '@vitecharts/core';
import * as data from '../data/datasets';

const { isDark } = useData();
const items = data.galleryItems;
const categories = data.categories;

// Reverse-lookup a dataset array back to its export name, so generated code can
// reference `data: salesByRegion` instead of inlining rows.
const dataNames = new Map();
for (const [name, value] of Object.entries(data)) {
  if (Array.isArray(value)) dataNames.set(value, name);
}

// ---- filter chips -------------------------------------------------------
const active = ref('all');
const counts = computed(() => {
  const c = { all: items.length };
  for (const cat of categories) c[cat.key] = items.filter((i) => i.category === cat.key).length;
  return c;
});
const chips = computed(() => [
  { key: 'all', label: 'All' },
  ...categories.map((c) => ({ key: c.key, label: c.label })),
]);
const visible = computed(() =>
  items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => active.value === 'all' || item.category === active.value),
);

// ---- grid charts --------------------------------------------------------
const containers = ref([]);
let charts = [];

function renderGrid() {
  charts.forEach((c) => c && c.destroy());
  charts = items.map((item, i) => {
    const el = containers.value[i];
    return el ? new Chart(el, { ...item.options, theme: 'css' }) : null;
  });
}

onMounted(renderGrid);
// Cards mount/unmount as the filter changes — re-bind charts to live containers.
watch(active, () => nextTick(renderGrid));
watch(isDark, () => {
  charts.forEach((c) => c && c.update({}));
  if (modalChart) modalChart.update({});
});
onBeforeUnmount(() => {
  charts.forEach((c) => c && c.destroy());
  charts = [];
  if (modalChart) modalChart.destroy();
});

// ---- code-reveal modal --------------------------------------------------
// shallowRef so the item (and its `options.data` array identity) isn't proxied —
// the code generator looks the dataset up by reference.
const openItem = shallowRef(null);
const modalCanvas = ref(null);
const copied = ref(false);
let modalChart = null;

function openCode(item) {
  openItem.value = item;
  copied.value = false;
  nextTick(() => {
    if (modalChart) modalChart.destroy();
    if (modalCanvas.value)
      modalChart = new Chart(modalCanvas.value, { ...item.options, theme: 'css' });
  });
}
function closeCode() {
  openItem.value = null;
  if (modalChart) {
    modalChart.destroy();
    modalChart = null;
  }
}
function onKey(e) {
  if (e.key === 'Escape') closeCode();
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

// ---- code generation ----------------------------------------------------
function fmt(value, indent) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return '(v) => …';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const parts = value.map((v) => `${padIn}${fmt(v, indent + 1)}`);
    return `[\n${parts.join(',\n')}\n${pad}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    const parts = entries.map(([k, v]) => `${padIn}${k}: ${fmt(v, indent + 1)}`);
    return `{\n${parts.join(',\n')}\n${pad}}`;
  }
  return String(value);
}

const codeText = computed(() => {
  const item = openItem.value;
  if (!item) return '';
  const { data: rows, ...rest } = item.options;
  const name = dataNames.get(rows);
  // Reference the imported dataset by name; fall back to inlining if unknown.
  const config = { type: rest.type, data: name ? `@${name}@` : rows };
  for (const [k, v] of Object.entries(rest)) if (k !== 'type') config[k] = v;
  let body = fmt(config, 0).replace(/'@(\w+)@'/g, '$1');
  const imp = name
    ? `import { Chart } from '@vitecharts/core'\nimport { ${name} } from './datasets'\n\n`
    : `import { Chart } from '@vitecharts/core'\n\n`;
  return `${imp}new Chart('#chart', ${body})`;
});

// Lightweight token highlighter (keys / strings / numbers / keywords).
const codeHtml = computed(() => {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc(codeText.value)
    .replace(/(\/\/[^\n]*)/g, '<span class="t-com">$1</span>')
    .replace(/&#39;|'([^']*)'/g, (m, g) =>
      g === undefined ? m : `<span class="t-str">'${g}'</span>`,
    )
    .replace(/\b(import|from|new)\b/g, '<span class="t-kw">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="t-bool">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="t-num">$1</span>')
    .replace(/^(\s*)([A-Za-z_]\w*)(:)/gm, '$1<span class="t-key">$2</span>$3')
    .replace(/(Chart)\b/g, '<span class="t-cls">$1</span>');
});

async function copyCode() {
  try {
    await navigator.clipboard.writeText(codeText.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1600);
  } catch {
    /* clipboard blocked */
  }
}
</script>

<template>
  <div class="vc-gallery-page">
    <div class="vc-gallery-head">
      <p class="vc-eyebrow">The gallery</p>
      <h1>Every chart, <em>live</em> and interactive.</h1>
      <p class="vc-gallery-sub">
        {{ items.length }} charts, one core. Every tile is a real, animated ViteCharts instance that
        follows the page theme. Hit <strong>‹›&nbsp;Code</strong> on any card to see the exact
        config — backed by reusable datasets you can import.
      </p>
    </div>

    <div class="vc-filters">
      <button
        v-for="chip in chips"
        :key="chip.key"
        class="vc-chip"
        :class="{ 'is-active': active === chip.key }"
        @click="active = chip.key"
      >
        {{ chip.label }} <span class="vc-chip-n">{{ counts[chip.key] }}</span>
      </button>
    </div>

    <div class="vc-gallery">
      <div class="vc-card" v-for="{ item, i } in visible" :key="i">
        <div
          class="vc-card-canvas"
          :ref="(el) => (containers[i] = el)"
          :style="{ height: (item.height || 240) + 'px' }"
        />
        <div class="vc-card-foot">
          <div class="vc-card-meta">
            <p class="vc-card-type">{{ item.type }}</p>
            <h3>{{ item.title }}</h3>
          </div>
          <button class="vc-code-btn" @click="openCode(item)">
            <span class="vc-code-ico">‹›</span> Code
          </button>
        </div>
      </div>
    </div>

    <!-- Code-reveal modal -->
    <Transition name="vc-modal">
      <div v-if="openItem" class="vc-modal-backdrop" @click.self="closeCode">
        <div class="vc-modal">
          <button class="vc-modal-x" @click="closeCode" aria-label="Close">×</button>
          <div class="vc-modal-grid">
            <div class="vc-modal-left">
              <p class="vc-card-type">{{ openItem.type }}</p>
              <h2>{{ openItem.title }}</h2>
              <p class="vc-modal-cap">{{ openItem.caption }}</p>
              <div
                class="vc-modal-canvas"
                ref="modalCanvas"
                :style="{ height: (openItem.height || 280) + 'px' }"
              />
            </div>
            <div class="vc-modal-right">
              <div class="vc-code">
                <div class="vc-code-bar">
                  <span class="vc-dot vc-dot-r"></span>
                  <span class="vc-dot vc-dot-y"></span>
                  <span class="vc-dot vc-dot-g"></span>
                  <span class="vc-code-file">chart.js</span>
                  <button class="vc-copy" @click="copyCode">
                    {{ copied ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
                <pre class="vc-code-body"><code v-html="codeHtml"></code></pre>
              </div>
              <a class="vc-api-btn" href="/api/options">Full API for this type →</a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
