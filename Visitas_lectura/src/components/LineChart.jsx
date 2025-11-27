import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar controladores/escala una sola vez
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ labels = [], dataset = [], title = '', color = 'var(--color-primary)' }) => {
  const data = {
    labels,
    datasets: [
      {
        label: title || 'Visitas',
        data: dataset,
        fill: false,
        borderColor: color,
        backgroundColor: color,
        tension: 0.2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title, color: 'var(--text)', font: { weight: '600' } },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.75)',
        titleColor: 'var(--text)',
        bodyColor: 'var(--text)',
        borderColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
      },
    },
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: {
        ticks: { color: 'var(--text)', maxRotation: 0, autoSkip: true },
        grid: { color: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: { color: 'var(--text)', precision: 0 },
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' },
      },
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 3, hoverRadius: 5, borderWidth: 0 },
    },
  };

  return (
    <div style={{ width: '100%', height: 280 }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
