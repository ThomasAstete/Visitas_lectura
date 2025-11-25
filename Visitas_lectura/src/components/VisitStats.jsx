// src/components/VisitStats.jsx
import { useState, useEffect } from 'react';
import { getVisitas } from '../lib/api.js';

const VisitStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const visits = await getVisitas();
      
      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const visitsToday = visits.filter(visit => 
        visit.fecha_visita && visit.fecha_visita.startsWith(today)
      ).length;
      
      const totalVisits = visits.length;
      const activeVisits = visits.filter(visit => !visit.hora_salida).length;

      setStats({
        total: totalVisits,
        today: visitsToday,
        active: activeVisits
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No hay datos</div>;

  return (
    <div className="stats-container">
      <h2>Estadísticas de Visitas</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Visitas</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Visitas Hoy</h3>
          <p className="stat-number">{stats.today}</p>
        </div>
        <div className="stat-card">
          <h3>Visitas Activas</h3>
          <p className="stat-number">{stats.active}</p>
        </div>
      </div>
    </div>
  );
};

export default VisitStats;