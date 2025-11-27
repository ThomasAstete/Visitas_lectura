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

const LineChart = ({ labels = [], dataset = [], title = '', color = 'rgba(99,102,241,0.8)' }) => {
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
      title: { display: !!title, text: title, color: '#fff' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' } },
      y: { ticks: { color: '#cbd5e1', precision: 0 }, beginAtZero: true },
    },
  };

  return (
    <div style={{ width: '100%', height: 280 }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
