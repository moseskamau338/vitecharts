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

new Chart('#chart', {
  type: 'line',
  data,
  x: 'month',
  series: [
    { y: 'sales', name: 'Sales' },
    { y: 'profit', name: 'Profit' },
  ],
  height: 360,
  axes: { y: { format: (v) => `$${v}k` } },
});
