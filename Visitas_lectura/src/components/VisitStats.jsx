// src/components/VisitStats.jsx
import { useState, useEffect } from 'react';
import { getVisitas } from '../lib/api.js';
import LineChart from './LineChart';
import { getVisitasAgg } from '../lib/api.js';

const VisitStats = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aggSeries, setAggSeries] = useState(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      // Primero intentamos pedir series ya agregadas desde el backend
      try {
        const todayAgg = await getVisitasAgg('day'); // por hora/hoy dependiente del backend
        const monthAgg = await getVisitasAgg('month');
        const yearAgg = await getVisitasAgg('year');

        // Si recibimos datos válidos, los transformamos en el formato interno
        const hasAgg = (todayAgg && todayAgg.data && todayAgg.data.length > 0) || (monthAgg && monthAgg.data && monthAgg.data.length > 0) || (yearAgg && yearAgg.data && yearAgg.data.length > 0);
        if (hasAgg) {
          // Guardamos visitas vacías (no necesarias) y almacenamos las series en el estado temporal
          setVisits([]);
          setAggSeries({
            today: todayAgg,
            month: monthAgg,
            year: yearAgg,
          });
          setError(null);
          return;
        }
      } catch (e) {
        // Si falla la petición de agregados, caemos al método anterior que descarga todas las visitas
        console.debug('Aggregated endpoints not available or failed, falling back to full fetch.', e);
      }

      const raw = await getVisitas();
      const arr = Array.isArray(raw) ? raw : (raw && raw.results && Array.isArray(raw.results) ? raw.results : []);
      setVisits(arr);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading visits for stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: safe parse date string
  const toDate = (s) => {
    if (!s) return null;
    try { return new Date(s); } catch (e) { return null; }
  };

  // Data: Hoy por hora (0-23)
  const buildTodayByHour = () => {
    const counts = new Array(24).fill(0);
    const todayStr = new Date().toISOString().split('T')[0];
    visits.forEach(v => {
      if (!v || !v.fecha_visita) return;
      const dt = toDate(v.fecha_visita);
      if (!dt) return;
      const isoDay = dt.toISOString().split('T')[0];
      if (isoDay !== todayStr) return;
      const hour = dt.getHours();
      counts[hour] = (counts[hour] || 0) + 1;
    });
    const labels = counts.map((_, i) => String(i).padStart(2,'0') + ':00');
    return { labels, data: counts };
  };

  // Data: Este mes por día
  const buildMonthByDay = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-index
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const counts = new Array(daysInMonth).fill(0);
    visits.forEach(v => {
      if (!v || !v.fecha_visita) return;
      const dt = toDate(v.fecha_visita);
      if (!dt) return;
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        const day = dt.getDate();
        counts[day - 1] = (counts[day -1] || 0) + 1;
      }
    });
    const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    return { labels, data: counts };
  };

  // Data: Este año por mes
  const buildYearByMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const counts = new Array(12).fill(0);
    visits.forEach(v => {
      if (!v || !v.fecha_visita) return;
      const dt = toDate(v.fecha_visita);
      if (!dt) return;
      if (dt.getFullYear() === year) {
        const m = dt.getMonth();
        counts[m] = (counts[m] || 0) + 1;
      }
    });
    const labels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return { labels, data: counts };
  };

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div>Error: {error}</div>;

  const totalVisits = visits.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const visitsToday = visits.filter(v => v && v.fecha_visita && v.fecha_visita.startsWith(todayStr)).length;
  const activeVisits = visits.filter(v => v && !v.hora_salida).length;

  const todayData = buildTodayByHour();
  const monthData = buildMonthByDay();
  const yearData = buildYearByMonth();

  return (
    <div className="stats-container">
      <h2 className="text-2xl font-semibold mb-4">Estadísticas de Visitas</h2>
      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card bg-zinc-900 p-4 rounded-md">
          <h3 className="text-sm text-gray-400">Total de Visitas</h3>
          <p className="text-3xl font-bold">{totalVisits}</p>
        </div>
        <div className="stat-card bg-zinc-900 p-4 rounded-md">
          <h3 className="text-sm text-gray-400">Visitas Hoy</h3>
          <p className="text-3xl font-bold">{visitsToday}</p>
        </div>
        <div className="stat-card bg-zinc-900 p-4 rounded-md">
          <h3 className="text-sm text-gray-400">Visitas Activas</h3>
          <p className="text-3xl font-bold">{activeVisits}</p>
        </div>
      </div>

      <div className="charts space-y-6">
        <div className="chart-card bg-zinc-900 p-4 rounded-md">
          <h4 className="text-sm text-gray-300 mb-2">Hoy (por hora)</h4>
          <LineChart labels={todayData.labels} dataset={todayData.data} title={"Visitas por Hora (Hoy)"} color={'rgba(59,130,246,0.9)'} />
        </div>

        <div className="chart-card bg-zinc-900 p-4 rounded-md">
          <h4 className="text-sm text-gray-300 mb-2">Este Mes (por día)</h4>
          <LineChart labels={monthData.labels} dataset={monthData.data} title={"Visitas por Día (Mes)"} color={'rgba(16,185,129,0.9)'} />
        </div>

        <div className="chart-card bg-zinc-900 p-4 rounded-md">
          <h4 className="text-sm text-gray-300 mb-2">Este Año (por mes)</h4>
          <LineChart labels={yearData.labels} dataset={yearData.data} title={"Visitas por Mes (Año)"} color={'rgba(168,85,247,0.9)'} />
        </div>
      </div>
    </div>
  );
};

export default VisitStats;