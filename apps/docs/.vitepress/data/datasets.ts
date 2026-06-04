// Reusable sample datasets for the gallery (and your own experiments). Real data
// where we could fetch it (FX rates); realistic curated data elsewhere.
import fx from './fx.json';

// ---------------------------------------------------------------------------
// Datasets (importable + reusable across charts)
// ---------------------------------------------------------------------------

export const fxRates = fx as { date: string; EUR: number; GBP: number; JPY: number }[];

export const salesByRegion = [
  { q: 'Q1', Americas: 128, EMEA: 96, APAC: 64 },
  { q: 'Q2', Americas: 162, EMEA: 118, APAC: 82 },
  { q: 'Q3', Americas: 150, EMEA: 134, APAC: 108 },
  { q: 'Q4', Americas: 198, EMEA: 156, APAC: 142 },
];

export const sessionsByDevice = [
  { day: 'Mon', Mobile: 32, Desktop: 44, Tablet: 12 },
  { day: 'Tue', Mobile: 38, Desktop: 46, Tablet: 14 },
  { day: 'Wed', Mobile: 35, Desktop: 50, Tablet: 11 },
  { day: 'Thu', Mobile: 42, Desktop: 48, Tablet: 15 },
  { day: 'Fri', Mobile: 48, Desktop: 52, Tablet: 17 },
  { day: 'Sat', Mobile: 58, Desktop: 40, Tablet: 22 },
  { day: 'Sun', Mobile: 52, Desktop: 36, Tablet: 19 },
];

export const githubStars = [
  { lang: 'TypeScript', stars: 12.8 },
  { lang: 'Python', stars: 11.1 },
  { lang: 'Rust', stars: 9.2 },
  { lang: 'Go', stars: 6.4 },
  { lang: 'Swift', stars: 3.1 },
  { lang: 'Kotlin', stars: 2.7 },
];

export const cashFlow = [
  { m: 'Jan', net: 42 },
  { m: 'Feb', net: -18 },
  { m: 'Mar', net: 26 },
  { m: 'Apr', net: -8 },
  { m: 'May', net: 34 },
  { m: 'Jun', net: -22 },
  { m: 'Jul', net: 48 },
];

export const stackedRevenue = [
  { m: 'Jan', Subscriptions: 210, Usage: 88, Services: 28 },
  { m: 'Feb', Subscriptions: 242, Usage: 102, Services: 31 },
  { m: 'Mar', Subscriptions: 246, Usage: 108, Services: 29 },
  { m: 'Apr', Subscriptions: 278, Usage: 116, Services: 38 },
  { m: 'May', Subscriptions: 320, Usage: 142, Services: 43 },
  { m: 'Jun', Subscriptions: 334, Usage: 160, Services: 47 },
  { m: 'Jul', Subscriptions: 366, Usage: 160, Services: 52 },
  { m: 'Aug', Subscriptions: 414, Usage: 186, Services: 58 },
];

export const latency = [
  { day: 'Mon', p50: 42, p95: 88, p99: 142 },
  { day: 'Tue', p50: 44, p95: 92, p99: 150 },
  { day: 'Wed', p50: 41, p95: 86, p99: 138 },
  { day: 'Thu', p50: 47, p95: 99, p99: 164 },
  { day: 'Fri', p50: 52, p95: 110, p99: 182 },
  { day: 'Sat', p50: 49, p95: 96, p99: 157 },
  { day: 'Sun', p50: 45, p95: 90, p99: 149 },
];

export const marketShare = [
  { label: 'Acme', value: 38 },
  { label: 'Globex', value: 24 },
  { label: 'Initech', value: 18 },
  { label: 'Umbrella', value: 12 },
  { label: 'Other', value: 8 },
];

export const serviceKpis = [
  { label: 'Uptime', value: 99 },
  { label: 'CSAT', value: 87 },
  { label: 'Coverage', value: 72 },
];

export const scorecard = [
  { axis: 'Speed', Now: 82, Target: 95 },
  { axis: 'Reliability', Now: 90, Target: 98 },
  { axis: 'Security', Now: 74, Target: 92 },
  { axis: 'UX', Now: 88, Target: 90 },
  { axis: 'Scale', Now: 70, Target: 96 },
  { axis: 'Cost', Now: 64, Target: 80 },
];

export const economies = [
  { gdp: 25, life: 79, name: 'US', pop: 331 },
  { gdp: 18, life: 78, name: 'China', pop: 1412 },
  { gdp: 3.4, life: 70, name: 'India', pop: 1408 },
  { gdp: 4.2, life: 81, name: 'Germany', pop: 83 },
  { gdp: 1.9, life: 76, name: 'Brazil', pop: 215 },
  { gdp: 5.0, life: 84, name: 'Japan', pop: 125 },
];

export const activity = (() => {
  const hours = ['12a', '4a', '8a', '12p', '4p', '8p'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const wave = [2, 1, 7, 9, 6, 3];
  return hours.map((h, hi) => {
    const row: Record<string, unknown> = { h };
    days.forEach((d, di) => {
      row[d] = Math.max(0, wave[hi]! + (d === 'Wed' ? 3 : 0) - (di % 2));
    });
    return row;
  });
})();

export const scoreDistribution = [
  { team: 'Alpha', min: 52, q1: 64, med: 71, q3: 80, max: 92 },
  { team: 'Bravo', min: 48, q1: 60, med: 68, q3: 77, max: 88 },
  { team: 'Charlie', min: 55, q1: 67, med: 74, q3: 83, max: 95 },
];

export const adSpend = Array.from({ length: 28 }, (_, i) => ({
  spend: 5 + Math.round(Math.random() * 95),
  revenue: 20 + i * 4 + Math.round(Math.random() * 60),
}));

export const conversion = [
  { stage: 'Visited', value: 18400 },
  { stage: 'Signed up', value: 9200 },
  { stage: 'Activated', value: 5100 },
  { stage: 'Subscribed', value: 2400 },
  { stage: 'Renewed', value: 1480 },
];

export const pipeline = [
  { stage: 'Applied', value: 1240 },
  { stage: 'Screened', value: 540 },
  { stage: 'Onsite', value: 180 },
  { stage: 'Offer', value: 64 },
  { stage: 'Hired', value: 41 },
];

export const signalWave = Array.from({ length: 48 }, (_, i) => ({
  t: i,
  v: 60 + Math.sin(i / 5) * 22 + Math.cos(i / 2.3) * 7,
}));

// ---------------------------------------------------------------------------
// Gallery items — { category, type label, title, caption, chart options }
// ---------------------------------------------------------------------------

export interface GalleryItem {
  category: 'lines' | 'bars' | 'circular' | 'distribution' | 'flow';
  type: string;
  title: string;
  caption: string;
  height?: number;
  options: Record<string, unknown>;
}

export const categories = [
  { key: 'lines', label: 'Lines & Area' },
  { key: 'bars', label: 'Bars & Columns' },
  { key: 'circular', label: 'Circular' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'flow', label: 'Flow & Hierarchy' },
] as const;

export const galleryItems: GalleryItem[] = [
  // Lines & Area
  {
    category: 'lines',
    type: 'Stacked area',
    title: 'Stacked revenue',
    caption: 'Subscriptions, usage and services over eight months.',
    options: {
      type: 'area',
      data: stackedRevenue,
      x: 'm',
      series: [
        { y: 'Subscriptions', name: 'Subscriptions', curve: 'smooth', gradient: true },
        { y: 'Usage', name: 'Usage', curve: 'smooth', gradient: true },
        { y: 'Services', name: 'Services', curve: 'smooth', gradient: true },
      ],
      stack: true,
      legend: true,
      markers: true,
    },
  },
  {
    category: 'lines',
    type: 'Multi-line',
    title: 'Request latency',
    caption: 'p50 / p95 / p99 response times across the week.',
    options: {
      type: 'line',
      data: latency,
      x: 'day',
      series: [
        { y: 'p50', name: 'p50', curve: 'smooth' },
        { y: 'p95', name: 'p95', curve: 'smooth' },
        { y: 'p99', name: 'p99', curve: 'smooth' },
      ],
      legend: true,
      markers: true,
    },
  },
  {
    category: 'lines',
    type: 'Time series',
    title: 'Currency strength',
    caption: 'Real USD → EUR / GBP / JPY rates (Frankfurter API).',
    options: {
      type: 'line',
      data: fxRates,
      x: 'date',
      series: [
        { y: 'EUR', name: 'EUR', curve: 'smooth' },
        { y: 'GBP', name: 'GBP', curve: 'smooth' },
        { y: 'JPY', name: 'JPY ×100', curve: 'smooth' },
      ],
      legend: true,
      axes: { x: { ticks: 5 } },
    },
  },
  {
    category: 'lines',
    type: 'Sparkline',
    title: 'Live signal',
    caption: 'A chromeless gradient area sparkline.',
    height: 150,
    options: {
      type: 'area',
      data: signalWave,
      x: 't',
      series: [{ y: 'v', curve: 'smooth', gradient: true }],
      sparkline: true,
    },
  },
  // Bars & Columns
  {
    category: 'bars',
    type: 'Grouped column',
    title: 'Sales by region',
    caption: 'Side-by-side columns across quarters.',
    options: {
      type: 'bar',
      data: salesByRegion,
      x: 'q',
      series: [
        { y: 'Americas', name: 'Americas' },
        { y: 'EMEA', name: 'EMEA' },
        { y: 'APAC', name: 'APAC' },
      ],
      legend: true,
    },
  },
  {
    category: 'bars',
    type: 'Stacked column',
    title: 'Sessions by device',
    caption: 'Mobile, desktop and tablet stacked by day.',
    options: {
      type: 'bar',
      data: sessionsByDevice,
      x: 'day',
      series: [
        { y: 'Mobile', name: 'Mobile' },
        { y: 'Desktop', name: 'Desktop' },
        { y: 'Tablet', name: 'Tablet' },
      ],
      stack: true,
      legend: true,
    },
  },
  {
    category: 'bars',
    type: 'Horizontal bar',
    title: 'GitHub stars',
    caption: 'Stars by language — ranked horizontal bars.',
    options: {
      type: 'bar',
      data: githubStars,
      x: 'lang',
      series: [{ y: 'stars', name: 'Stars (k)' }],
      horizontal: true,
      dataLabels: true,
      padding: { left: 88 },
    },
  },
  {
    category: 'bars',
    type: 'Column ±',
    title: 'Net cash flow',
    caption: 'Positive and negative monthly columns.',
    options: {
      type: 'bar',
      data: cashFlow,
      x: 'm',
      series: [{ y: 'net', name: 'Net' }],
    },
  },
  // Circular
  {
    category: 'circular',
    type: 'Donut',
    title: 'Market share',
    caption: 'Five vendors with a center total.',
    height: 300,
    options: { type: 'donut', data: marketShare, x: 'label', series: [{ y: 'value' }] },
  },
  {
    category: 'circular',
    type: 'Radial gauge',
    title: 'Service KPIs',
    caption: 'Concentric gauges as a percentage of target.',
    height: 300,
    options: { type: 'radialBar', data: serviceKpis, x: 'label', series: [{ y: 'value' }] },
  },
  {
    category: 'circular',
    type: 'Radar',
    title: 'Platform scorecard',
    caption: 'Current vs target across six dimensions.',
    height: 320,
    options: {
      type: 'radar',
      data: scorecard,
      x: 'axis',
      series: [
        { y: 'Now', name: 'Now' },
        { y: 'Target', name: 'Target' },
      ],
      legend: true,
    },
  },
  // Distribution
  {
    category: 'distribution',
    type: 'Bubble',
    title: 'Economies',
    caption: 'GDP vs life expectancy; bubble = population.',
    options: {
      type: 'scatter',
      data: economies,
      x: 'gdp',
      series: [{ y: 'life', name: 'Country', size: 'pop' }],
      axes: { y: { min: 65, max: 88 } },
    },
  },
  {
    category: 'distribution',
    type: 'Heatmap',
    title: 'Commit activity',
    caption: 'Commits by hour block and weekday.',
    options: {
      type: 'heatmap',
      data: activity,
      x: 'h',
      series: [
        { y: 'Mon', name: 'Mon' },
        { y: 'Tue', name: 'Tue' },
        { y: 'Wed', name: 'Wed' },
        { y: 'Thu', name: 'Thu' },
        { y: 'Fri', name: 'Fri' },
      ],
    },
  },
  {
    category: 'distribution',
    type: 'Boxplot',
    title: 'Score distribution',
    caption: 'Quartiles and whiskers per team.',
    options: {
      type: 'boxplot',
      data: scoreDistribution,
      x: 'team',
      series: [{ y: 'med', low: 'min', q1: 'q1', median: 'med', q3: 'q3', high: 'max' }],
    },
  },
  {
    category: 'distribution',
    type: 'Scatter',
    title: 'Ad spend vs revenue',
    caption: 'Each point is a campaign.',
    options: {
      type: 'scatter',
      data: adSpend,
      x: 'spend',
      series: [{ y: 'revenue', name: 'Campaign' }],
      axes: { x: { format: (v: unknown) => `$${v}k` } },
    },
  },
  // Flow & Hierarchy
  {
    category: 'flow',
    type: 'Funnel',
    title: 'Conversion funnel',
    caption: 'From first visit to renewal.',
    height: 320,
    options: { type: 'funnel', data: conversion, x: 'stage', series: [{ y: 'value' }] },
  },
  {
    category: 'flow',
    type: 'Funnel',
    title: 'Hiring pipeline',
    caption: 'Candidates at each stage.',
    height: 320,
    options: { type: 'funnel', data: pipeline, x: 'stage', series: [{ y: 'value' }] },
  },
];
