import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  title: 'ViteCharts',
  description: 'Animated, framework-agnostic charts with the feel of ApexCharts.',
  // Served from https://moseskamau338.github.io/vitecharts/ on GitHub Pages.
  base: '/vitecharts/',
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    // A single dark syntax theme — code blocks are always dark (warm-tinted via
    // --vp-code-block-bg), readable on both light and dark pages.
    theme: 'github-dark',
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500;1,6..72,600&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: 'Gallery', link: '/gallery' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Charts', link: '/charts/line' },
      { text: 'Features', link: '/features/animation' },
      { text: 'Adapters', link: '/adapters' },
      { text: 'API', link: '/api' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Concepts', link: '/guide/concepts' },
        ],
      },
      {
        text: 'Charts',
        items: [
          { text: 'Line & Spline', link: '/charts/line' },
          { text: 'Area', link: '/charts/area' },
          { text: 'Bar & Column', link: '/charts/bar' },
          { text: 'Scatter & Bubble', link: '/charts/scatter' },
          { text: 'Combo', link: '/charts/combo' },
          { text: 'Financial & Statistical', link: '/charts/financial' },
          { text: 'Heatmap', link: '/charts/heatmap' },
          { text: 'Funnel', link: '/charts/funnel' },
          { text: 'Pie & Donut', link: '/charts/pie' },
          { text: 'Radial & Gauge', link: '/charts/radial' },
          { text: 'Radar', link: '/charts/radar' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Animation', link: '/features/animation' },
          { text: 'Interaction', link: '/features/interaction' },
          { text: 'Zoom, Pan & Toolbar', link: '/features/zoom' },
          { text: 'Brushing & Sync', link: '/features/brushing' },
          { text: 'Styling', link: '/features/styling' },
          { text: 'Annotations', link: '/features/annotations' },
          { text: 'Export', link: '/features/export' },
          { text: 'Theming', link: '/features/theming' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Adapters', link: '/adapters' },
          { text: 'Migrating from ApexCharts', link: '/migration' },
          { text: 'API', link: '/api' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/moseskamau338/vitecharts' }],
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 Moses Kamau',
    },
    search: { provider: 'local' },
  },
  vite: {
    resolve: {
      alias: {
        // Use package sources directly so docs build without a prior lib build.
        '@vitecharts/core': r('../../../packages/core/src/index.ts'),
        '@vitecharts/compat-apex': r('../../../packages/compat-apex/src/index.ts'),
      },
    },
  },
});
