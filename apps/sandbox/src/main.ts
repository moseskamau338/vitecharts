import { Chart } from '@vitecharts/core';

const data = [
  { month: 'Jan', sales: 30, profit: 12 },
  { month: 'Feb', sales: 40, profit: 18 },
  { month: 'Mar', sales: 35, profit: 15 },
  { month: 'Apr', sales: 55, profit: 28 },
  { month: 'May', sales: 49, profit: 22 },
  { month: 'Jun', sales: 70, profit: 41 },
  { month: 'Jul', sales: 62, profit: 35 },
];

const chart = new Chart('#chart', {
  type: 'line',
  data,
  x: 'month',
  series: [
    { y: 'sales', name: 'Sales', curve: 'smooth' },
    { y: 'profit', name: 'Profit', curve: 'smooth' },
  ],
  height: 360,
  theme: 'light',
  markers: true,
  animate: 'apex', // line draw-on + staggered marker pop on mount
  axes: { y: { format: (v) => `$${v}k` } },
});

// Demo the streaming API: append a new month every 1.5s, drop the oldest.
let n = 8;
const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let i = 0;
const timer = setInterval(() => {
  if (i >= months.length) return clearInterval(timer);
  const sales = 40 + Math.round(Math.abs(Math.sin(n)) * 40);
  chart.appendData({ month: months[i], sales, profit: Math.round(sales * 0.5) });
  n++;
  i++;
}, 1500);
