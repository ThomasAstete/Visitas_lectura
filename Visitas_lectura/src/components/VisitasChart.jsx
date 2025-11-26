import { useState, useEffect } from 'react';
import { getVisitas, deleteVisita } from '../lib/api.js';

const VisitList = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await getVisitas();
      const normalized = Array.isArray(data) ? data : (data && data.results && Array.isArray(data.results) ? data.results : []);
      setVisits(normalized);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta visita?')) {
      try {
        await deleteVisita(id);
        await loadVisits(); // Recargar la lista
      } catch (err) {
        alert('Error al eliminar la visita: ' + err.message);
      }
    }
  };

  return (
    <div className="visits-container">
      <div className="visits-header">
        <h2>Lista de Visitas</h2>
        <a href="/visits/new" className="btn-primary">
          Nueva Visita
        </a>
      </div>

      {loading && <p>Cargando visitas...</p>}
      
      {error && (
        <div className="error-message">
          Error al cargar visitas: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="visits-grid">
          {visits.length === 0 ? (
            <p>No hay visitas registradas.</p>
          ) : (
            visits.map(visit => (
              <div className="visit-card" key={visit.id}>
                <div className="visit-info">
                  <h3>{visit.nombre || 'Visitante'}</h3>
                  <p><strong>Empresa:</strong> {visit.empresa || 'N/A'}</p>
                  <p><strong>Motivo:</strong> {visit.motivo_visita || 'N/A'}</p>
                  <p><strong>Fecha:</strong> {new Date(visit.fecha_visita).toLocaleDateString()}</p>
                  <p><strong>Hora de entrada:</strong> {visit.hora_entrada}</p>
                  {visit.hora_salida && (
                    <p><strong>Hora de salida:</strong> {visit.hora_salida}</p>
                  )}
                </div>
                <div className="visit-actions">
                  <a href={`/visits/${visit.id}`} className="btn-secondary">
                    Ver Detalles
                  </a>
                  <button 
                    onClick={() => handleDelete(visit.id)}
                    className="btn-danger"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VisitList;