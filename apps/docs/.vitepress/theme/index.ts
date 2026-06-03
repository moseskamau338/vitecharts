import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import ChartDemo from './ChartDemo.vue';
import StreamDemo from './StreamDemo.vue';
import ThemeDemo from './ThemeDemo.vue';
import ExportDemo from './ExportDemo.vue';
import BrushDemo from './BrushDemo.vue';
import SyncDemo from './SyncDemo.vue';
import MorphDemo from './MorphDemo.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ChartDemo', ChartDemo);
    app.component('StreamDemo', StreamDemo);
    app.component('ThemeDemo', ThemeDemo);
    app.component('ExportDemo', ExportDemo);
    app.component('BrushDemo', BrushDemo);
    app.component('SyncDemo', SyncDemo);
    app.component('MorphDemo', MorphDemo);
  },
} satisfies Theme;
