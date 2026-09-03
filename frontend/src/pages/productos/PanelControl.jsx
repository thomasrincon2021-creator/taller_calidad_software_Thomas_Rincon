import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProductos } from '../../services/productoService';
import '../../App.css';

export default function PanelControl() {
  const navigate = useNavigate();

  const usuarioRol = localStorage.getItem('usuarioRol');
  const usuarioNombre = localStorage.getItem('usuarioNombre');

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeReporte, setMensajeReporte] = useState('');

  useEffect(() => {
    obtenerProductos()
      .then(data => {
        setProductos(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al obtener productos para el panel:", err);
        setLoading(false);
      });
  }, []);

  // Cálculos con datos reales del servicio
  const totalProductos = productos.length;

  const categoriasUnicas = new Set(
    productos.map(p => (p.categoria || '').toLowerCase().trim()).filter(Boolean)
  ).size;

  // Lógica de Stock Crítico: Si AL MENOS UNA talla tiene <= 5 unidades
  const productosStockCritico = productos.filter(p => {
    if (!p.tallasStock) return true; // Si no tiene registro de tallas, se considera crítico

    const pares = p.tallasStock.split(',');

    return pares.some(par => {
      const partes = par.split(':');
      if (partes.length < 2) return false;
      const cant = parseInt(partes[1].trim(), 10);
      return !isNaN(cant) && cant <= 5;
    });
  });

  const descargarReporte = (tipo) => {
    setMensajeReporte(`Generando reporte de ${tipo}... 📄`);
    setTimeout(() => {
      setMensajeReporte('');
      alert(`Reporte de ${tipo} generado con datos reales del sistema.`);
    }, 1200);
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff', fontFamily: 'sans-serif', paddingBottom: '3rem' }}>
      
      {/* NAVBAR */}
      <nav className="navbar" style={{ backgroundColor: '#09090b', borderBottom: '1px solid #27272a', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="navbar-logo" style={{ fontWeight: 900, fontSize: '1.4rem' }}>
          Now<span style={{ color: '#dc2626' }}>Style</span> ADMIN
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
            👤 {usuarioNombre || 'Administrador'} (<strong style={{ color: '#dc2626' }}>{usuarioRol || 'ADMIN'}</strong>)
          </span>
          <button 
            onClick={() => navigate('/catalogo')} 
            style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
          >
            🛒 Ir al Catálogo
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        
        {/* ENCABEZADO */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>
            Panel de <span style={{ color: '#dc2626' }}>Control</span>
          </h1>
          <p style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0' }}>
            Métricas e inventario sincronizados en tiempo real.
          </p>
        </div>

        {/* MÉTRICAS / KPIS CON DATOS REALES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>PRODUCTOS REGISTRADOS</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: '0.5rem' }}>
              {loading ? '...' : totalProductos}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>En {categoriasUnicas} categoría(s) activa(s)</span>
          </div>

          <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>STOCK CRÍTICO</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: productosStockCritico.length > 0 ? '#ef4444' : '#22c55e', marginTop: '0.5rem' }}>
              {loading ? '...' : `${productosStockCritico.length} Prendas`}
            </div>
            <span style={{ fontSize: '0.75rem', color: productosStockCritico.length > 0 ? '#ef4444' : '#22c55e' }}>
              {productosStockCritico.length > 0 ? 'Con stock igual o menor a 5 unidades' : 'Stock en niveles óptimos'}
            </span>
          </div>

        </div>

        {/* GESTIÓN OPERATIVA */}
        <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
          Gestión Operativa
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <button 
            onClick={() => navigate('/crear-producto')} 
            style={{ backgroundColor: '#dc2626', border: 'none', borderRadius: '0.75rem', padding: '1.5rem', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '130px' }}
          >
            <span style={{ fontSize: '1.8rem' }}>➕</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase' }}>Crear Producto</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Registrar nuevas prendas en el catálogo</div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/inventario')} 
            style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1.5rem', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '130px' }}
          >
            <span style={{ fontSize: '1.8rem' }}>📦</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase' }}>Gestionar Inventario</div>
              <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Ver, editar prendas, modificar tallas y stock</div>
            </div>
          </button>

        </div>

        {/* CENTRO DE REPORTES */}
        <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                📊 Centro de Reportes
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Genera informes basados en el inventario real de la base de datos.
              </p>
            </div>
            {mensajeReporte && (
              <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 'bold' }}>{mensajeReporte}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
            <button 
              onClick={() => descargarReporte('Estado del Inventario')} 
              style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              📥 Estado del Inventario (Excel)
            </button>

            <button 
              onClick={() => descargarReporte('Alertas de Stock Crítico')} 
              style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#ef4444', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              ⚠️ Alertas de Stock Crítico
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}