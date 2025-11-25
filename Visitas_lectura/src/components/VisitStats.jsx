import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

const VisitStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    activas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [estadisticas, visitasHoy] = await Promise.all([
        apiClient.getEstadisticas(),
        apiClient.getVisitasHoy()
      ]);
      
      setStats({
        total: estadisticas.total_visitas || 0,
        hoy: visitasHoy.length || 0,
        activas: estadisticas.visitas_activas || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stats-container">
      <h2>Estadísticas</h2>
      
      {loading ? (
        <p>Cargando estadísticas...</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Total Visitas</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Visitas Hoy</h3>
              <p className="stat-number">{stats.hoy}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <h3>Visitas Activas</h3>
              <p className="stat-number">{stats.activas}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitStats;