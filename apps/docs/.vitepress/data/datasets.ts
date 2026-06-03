// Real data where we could fetch it (FX rates), realistic curated data elsewhere.
import fx from './fx.json';

export const fxData = fx as { date: string; EUR: number; GBP: number; JPY: number }[];

/** Curated, realistic-looking daily OHLC for a "market" candlestick. */
function makeCandles(): { d: string; o: number; h: number; l: number; c: number }[] {
  let price = 168;
  const out = [];
  const seed = [3, -2, 5, -1, 4, -6, 2, 7, -3, 1, 6, -4, 3, 5, -2, 8, -5, 2, 4, -1, 3, -3, 6, 2];
  for (let i = 0; i < seed.length; i++) {
    const o = price;
    const c = +(o + seed[i]!).toFixed(1);
    const h = +(Math.max(o, c) + Math.abs(seed[i]!) * 0.4 + 1).toFixed(1);
    const l = +(Math.min(o, c) - Math.abs(seed[i]!) * 0.4 - 1).toFixed(1);
    out.push({ d: `D${i + 1}`, o, h, l, c });
    price = c;
  }
  return out;
}
export const candles = makeCandles();

export const revenue = [
  { q: 'Q1', cloud: 42, devices: 28, services: 18 },
  { q: 'Q2', cloud: 51, devices: 26, services: 22 },
  { q: 'Q3', cloud: 58, devices: 24, services: 27 },
  { q: 'Q4', cloud: 71, devices: 31, services: 34 },
];

export const marketShare = [
  { label: 'Acme', value: 38 },
  { label: 'Globex', value: 24 },
  { label: 'Initech', value: 18 },
  { label: 'Umbrella', value: 12 },
  { label: 'Other', value: 8 },
];

export const traffic = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 1}`,
  Organic: 40 + Math.round(Math.sin(i / 2) * 12) + i,
  Direct: 22 + Math.round(Math.cos(i / 3) * 6),
  Social: 14 + Math.round(Math.sin(i / 1.5) * 8) + (i % 3),
}));

export const skills = [
  { axis: 'Speed', Now: 82, Target: 95 },
  { axis: 'Reliability', Now: 90, Target: 98 },
  { axis: 'Security', Now: 74, Target: 92 },
  { axis: 'UX', Now: 88, Target: 90 },
  { axis: 'Scale', Now: 70, Target: 96 },
  { axis: 'Cost', Now: 64, Target: 80 },
];

export const funnel = [
  { stage: 'Visited', value: 18400 },
  { stage: 'Signed up', value: 9200 },
  { stage: 'Activated', value: 5100 },
  { stage: 'Subscribed', value: 2400 },
  { stage: 'Renewed', value: 1480 },
];

export const gauges = [
  { label: 'Uptime', value: 99 },
  { label: 'CSAT', value: 87 },
  { label: 'Coverage', value: 72 },
];

/** Commit activity heatmap: rows = hours blocks, series = weekdays. */
export const activity = (() => {
  const hours = ['12a', '4a', '8a', '12p', '4p', '8p'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return hours.map((h, hi) => {
    const row: Record<string, unknown> = { h };
    for (const d of days) {
      // busier in the afternoon / midweek
      const base = (hi === 2 || hi === 3 ? 8 : 2) + (d === 'Wed' ? 4 : 0);
      row[d] = Math.max(0, base + Math.round(Math.sin(hi + d.length) * 4));
    }
    return row;
  });
})();

export const bubbles = [
  { gdp: 25, life: 79, name: 'US', pop: 331 },
  { gdp: 18, life: 78, name: 'China', pop: 1412 },
  { gdp: 3.4, life: 70, name: 'India', pop: 1408 },
  { gdp: 4.2, life: 81, name: 'Germany', pop: 83 },
  { gdp: 1.9, life: 76, name: 'Brazil', pop: 215 },
  { gdp: 5.0, life: 84, name: 'Japan', pop: 125 },
];

export const signal = Array.from({ length: 48 }, (_, i) => ({
  t: i,
  v: 60 + Math.sin(i / 5) * 22 + Math.cos(i / 2.3) * 7,
}));

/** Each gallery card: a title, a one-line caption, and the chart options. */
export const galleryItems = [
  {
    title: 'Currency strength',
    caption: 'Real USD → EUR / GBP / JPY rates (Frankfurter API).',
    options: {
      type: 'line',
      data: fxData,
      x: 'date',
      series: [
        { y: 'EUR', name: 'EUR', curve: 'smooth' },
        { y: 'GBP', name: 'GBP', curve: 'smooth' },
        { y: 'JPY', name: 'JPY ×100', curve: 'smooth' },
      ],
      legend: true,
      animate: 'apex',
      axes: { x: { ticks: 5 } },
    },
  },
  {
    title: 'Market — last 24 sessions',
    caption: 'Candlestick OHLC with up/down candles.',
    options: {
      type: 'candlestick',
      data: candles,
      x: 'd',
      series: [{ y: 'c', open: 'o', high: 'h', low: 'l', close: 'c' }],
      animate: 'apex',
      axes: { x: { ticks: 6 } },
    },
  },
  {
    title: 'Revenue by segment',
    caption: 'Stacked columns across four quarters.',
    options: {
      type: 'bar',
      data: revenue,
      x: 'q',
      series: [
        { y: 'cloud', name: 'Cloud' },
        { y: 'devices', name: 'Devices' },
        { y: 'services', name: 'Services' },
      ],
      stack: true,
      legend: true,
      animate: 'apex',
    },
  },
  {
    title: 'Market share',
    caption: 'Donut with a center total.',
    options: {
      type: 'donut',
      data: marketShare,
      x: 'label',
      series: [{ y: 'value' }],
      animate: 'apex',
    },
  },
  {
    title: 'Traffic sources',
    caption: 'Stacked gradient area over two weeks.',
    options: {
      type: 'area',
      data: traffic,
      x: 'day',
      series: [
        { y: 'Organic', name: 'Organic', curve: 'smooth', gradient: true },
        { y: 'Direct', name: 'Direct', curve: 'smooth', gradient: true },
        { y: 'Social', name: 'Social', curve: 'smooth', gradient: true },
      ],
      stack: true,
      legend: true,
      animate: 'apex',
    },
  },
  {
    title: 'Platform scorecard',
    caption: 'Radar — current vs target.',
    options: {
      type: 'radar',
      data: skills,
      x: 'axis',
      series: [
        { y: 'Now', name: 'Now' },
        { y: 'Target', name: 'Target' },
      ],
      legend: true,
      animate: 'apex',
    },
  },
  {
    title: 'Conversion funnel',
    caption: 'From first visit to renewal.',
    options: {
      type: 'funnel',
      data: funnel,
      x: 'stage',
      series: [{ y: 'value' }],
      animate: 'apex',
    },
  },
  {
    title: 'Service KPIs',
    caption: 'Radial gauges as a percentage of target.',
    options: {
      type: 'radialBar',
      data: gauges,
      x: 'label',
      series: [{ y: 'value' }],
      animate: 'apex',
    },
  },
  {
    title: 'Commit activity',
    caption: 'Heatmap of commits by hour and weekday.',
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
      animate: 'apex',
    },
  },
  {
    title: 'Economies',
    caption: 'Bubble — GDP vs life expectancy (bubble = population).',
    options: {
      type: 'scatter',
      data: bubbles,
      x: 'gdp',
      series: [{ y: 'life', name: 'Country', size: 'pop' }],
      animate: 'apex',
      axes: { x: { format: (v: unknown) => `$${v}T` }, y: { min: 65, max: 88 } },
    },
  },
  {
    title: 'Live signal',
    caption: 'A smooth gradient area sparkline.',
    options: {
      type: 'area',
      data: signal,
      x: 't',
      series: [{ y: 'v', curve: 'smooth', gradient: true }],
      sparkline: true,
      animate: 'apex',
    },
  },
  {
    title: 'Quarterly profit',
    caption: 'Columns with positive & negative values + data labels.',
    options: {
      type: 'bar',
      data: [
        { m: 'Jan', p: 12 },
        { m: 'Feb', p: -6 },
        { m: 'Mar', p: 9 },
        { m: 'Apr', p: 17 },
        { m: 'May', p: -3 },
        { m: 'Jun', p: 21 },
      ],
      x: 'm',
      series: [{ y: 'p', name: 'Profit' }],
      dataLabels: true,
      animate: 'apex',
    },
  },
];
