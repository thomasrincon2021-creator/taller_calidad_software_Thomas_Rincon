import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const TALLAS_DISPONIBLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export default function InventarioPrendas() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estados para Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [ordenPrecio, setOrdenPrecio] = useState('defecto');

  // Estados para Modal de Edición
  const [productoEditar, setProductoEditar] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editTallas, setEditTallas] = useState({}); // Objeto para tallas { "M": 1, "L": 2 }
  const [editImagenBase64, setEditImagenBase64] = useState('');
  const [editNombreArchivo, setEditNombreArchivo] = useState('');

  // Convierte "M: 1, L: 2" a un objeto { M: 1, L: 2 }
  const parsearTallasAObjeto = (strTallas) => {
    if (!strTallas) return {};
    const resultado = {};
    const pares = strTallas.split(',');
    pares.forEach(par => {
      const [talla, cantidad] = par.split(':');
      if (talla && cantidad !== undefined) {
        resultado[talla.trim()] = parseInt(cantidad.trim(), 10) || 0;
      }
    });
    return resultado;
  };

  // Convierte el objeto { M: 1, L: 2 } al formato string "M: 1, L: 2" para la BD
  const convertirTallasAString = (objTallas) => {
    return Object.entries(objTallas)
      .map(([talla, cantidad]) => `${talla}: ${cantidad}`)
      .join(', ');
  };

  const cargarProductos = () => {
    fetch('http://localhost:8080/api/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => {
        setProductos([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Abrir modal con los datos cargados y tallas parseadas
  const abrirEditar = (prod) => {
    setProductoEditar(prod);
    setEditNombre(prod.nombre || '');
    setEditDescripcion(prod.descripcion || '');
    setEditCategoria(prod.categoria || 'Camisetas');
    setEditColor(prod.color || '');
    setEditPrecio(prod.precio || '');
    setEditTallas(parsearTallasAObjeto(prod.tallasStock));
    setEditImagenBase64(prod.imagen || '');
    setEditNombreArchivo('');
  };

  const handleTallaToggle = (talla) => {
    setEditTallas(prev => {
      const nuevasTallas = { ...prev };
      if (nuevasTallas.hasOwnProperty(talla)) {
        delete nuevasTallas[talla];
      } else {
        nuevasTallas[talla] = 1;
      }
      return nuevasTallas;
    });
  };

const handleStockChange = (talla, valor) => {
  // Si el campo se borra por completo, dejamos cadena vacía temporalmente
  if (valor === '') {
    setEditTallas(prev => ({
      ...prev,
      [talla]: ''
    }));
    return;
  }

  // Si se ingresa un número, parseamos como entero sin permitir negativos
  const cantidad = Math.max(0, parseInt(valor, 10) || 0);
  setEditTallas(prev => ({
    ...prev,
    [talla]: cantidad
  }));
};

  // Manejar cambio de imagen en la edición
  const handleEditImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setEditNombreArchivo(archivo.name);
      const lector = new FileReader();
      lector.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = (img.height * 800) / img.width;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setEditImagenBase64(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      lector.readAsDataURL(archivo);
    }
  };

  // Guardar cambios al actualizar
  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    const precioNum = parseFloat(editPrecio);

    if (!editNombre.trim() || isNaN(precioNum)) {
      mostrarMensaje('Completa el nombre y precio.', 'error');
      return;
    }

    const productoActualizado = {
      ...productoEditar,
      nombre: editNombre.trim(),
      descripcion: editDescripcion.trim(),
      categoria: editCategoria,
      color: editColor.trim(),
      precio: precioNum,
      tallasStock: convertirTallasAString(editTallas),
      imagen: editImagenBase64
    };

    fetch(`http://localhost:8080/api/productos/${productoEditar.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoActualizado)
    })
      .then(res => res.json())
      .then(data => {
        setProductos(productos.map(p => p.id === data.id ? data : p));
        setProductoEditar(null);
        mostrarMensaje('¡Prenda actualizada con éxito!', 'exito');
      })
      .catch(() => {
        mostrarMensaje('Error al actualizar en el servidor.', 'error');
      });
  };

  const handleEliminar = (id) => {
    if (!window.confirm('¿Eliminar esta prenda del catálogo?')) return;

    fetch(`http://localhost:8080/api/productos/${id}`, { method: 'DELETE' })
      .then(() => {
        setProductos(productos.filter(p => p.id !== id));
        mostrarMensaje('Prenda eliminada.', 'exito');
      })
      .catch(() => {
        mostrarMensaje('Error al eliminar.', 'error');
      });
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3500);
  };

  // Lógica de Filtros y Ordenamiento
  const productosFiltrados = productos
    .filter(p => {
      const coincideBusqueda = (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                               (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriaFiltro === 'Todas' || (p.categoria || '') === categoriaFiltro;
      return coincideBusqueda && coincideCategoria;
    })
    .sort((a, b) => {
      if (ordenPrecio === 'menor') return a.precio - b.precio;
      if (ordenPrecio === 'mayor') return b.precio - a.precio;
      return 0;
    });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 900 }}>NOWSTYLE</h1>
          <p style={{ margin: 0, color: '#a1a1aa' }}>Inventario General y Gestión</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/crear-producto')} style={{ backgroundColor: '#dc2626', border: 'none', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            + Crear Nueva Prenda
          </button>
          <button onClick={() => navigate('/catalogo')} style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Ir a la Tienda 🛒
          </button>
        </div>
      </header>

      {mensaje.texto && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: mensaje.tipo === 'exito' ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 'bold' }}>
          {mensaje.texto}
        </div>
      )}

      <main style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.5rem' }}>
        
        {/* BARRA DE FILTROS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', backgroundColor: '#000', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #18181b' }}>
          <input
            type="text"
            placeholder="🔍 Buscar prendas..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ flex: '1 1 200px', padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#09090b', color: '#fff' }}
          />

          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#09090b', color: '#fff' }}>
            <option value="Todas">Todas las Categorías</option>
            <option value="Camisetas">Camisetas</option>
            <option value="Hoodies">Hoodies</option>
            <option value="Oversize">Oversize</option>
          </select>

          <select value={ordenPrecio} onChange={e => setOrdenPrecio(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#09090b', color: '#fff' }}>
            <option value="defecto">Ordenar por Precio</option>
            <option value="menor">Menor a Mayor</option>
            <option value="mayor">Mayor a Menor</option>
          </select>
        </div>

        {loading ? (
          <div style={{ color: '#a1a1aa', textAlign: 'center', padding: '3rem' }}>Cargando inventario...</div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ color: '#a1a1aa', textAlign: 'center', padding: '3rem' }}>No se encontraron coincidencias.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27272a', color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Prenda</th>
                  <th style={{ padding: '1rem' }}>Categoría / Color</th>
                  <th style={{ padding: '1rem' }}>Stock por Talla</th>
                  <th style={{ padding: '1rem' }}>Precio</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(prod => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid #18181b' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={prod.imagen || ''} alt={prod.nombre} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem', backgroundColor: '#000' }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '1rem' }}>{prod.nombre}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{prod.descripcion}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ display: 'block', fontWeight: 'bold' }}>{prod.categoria}</span>
                      <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{prod.color}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: '#18181b', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #27272a', color: '#dc2626', fontWeight: 'bold' }}>
                        {prod.tallasStock || 'Sin stock'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1rem' }}>
                      ${Number(prod.precio).toLocaleString('es-CO')} COP
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => abrirEditar(prod)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: 'bold' }}>
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleEliminar(prod.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: 'bold' }}>
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL PARA ACTUALIZAR PRENDA (NUEVA INTERFAZ DE TALLAS) */}
      {productoEditar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '520px', color: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #27272a', paddingBottom: '0.5rem' }}>✏️ Actualizar Prenda</h2>
            <form onSubmit={handleGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Nombre:</label>
                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Descripción:</label>
                <textarea value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} rows="2" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Categoría:</label>
                  <select value={editCategoria} onChange={e => setEditCategoria(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff' }}>
                    <option value="Camisetas">Camisetas</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Oversize">Oversize</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Color:</label>
                  <input type="text" value={editColor} onChange={e => setEditColor(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* SECCIÓN INTERACTIVA DE TALLAS */}
              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block', marginBottom: '0.5rem' }}>1. Selecciona las tallas disponibles:</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {TALLAS_DISPONIBLES.map(talla => {
                    const activa = editTallas.hasOwnProperty(talla);
                    return (
                      <button
                        key={talla}
                        type="button"
                        onClick={() => handleTallaToggle(talla)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '0.4rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          backgroundColor: activa ? '#dc2626' : '#27272a',
                          color: '#fff'
                        }}
                      >
                        {talla}
                      </button>
                    );
                  })}
                </div>
              </div>

              {Object.keys(editTallas).length > 0 && (
                <div style={{ backgroundColor: '#000', border: '1px solid #27272a', padding: '1rem', borderRadius: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block', marginBottom: '0.5rem' }}>2. Ingresa stock por talla:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {Object.keys(editTallas).map(talla => (
                      <div key={talla}>
                        <label style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '0.2rem' }}>Talla {talla}</label>
                        <input
                          type="number"
                          min="0"
                          value={editTallas[talla]}
                          onChange={e => handleStockChange(talla, e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid #27272a', backgroundColor: '#09090b', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Precio (COP):</label>
                <input type="number" value={editPrecio} onChange={e => setEditPrecio(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
              </div>

              {/* CAMPO DE EDICIÓN DE FOTOGRAFÍA */}
              <div>
                <label style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Fotografía de la Prenda:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {editImagenBase64 && (
                    <img src={editImagenBase64} alt="Vista previa" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.4rem', border: '1px solid #27272a' }} />
                  )}
                  <label htmlFor="edit-file-input" style={{ backgroundColor: '#27272a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer', border: '1px solid #3f3f46', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    📁 Cambiar Foto
                  </label>
                  <input id="edit-file-input" type="file" accept="image/*" onChange={handleEditImagenChange} style={{ display: 'none' }} />
                  <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>{editNombreArchivo || 'Mantener imagen actual'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>💾 Guardar Cambios</button>
                <button type="button" onClick={() => setProductoEditar(null)} style={{ flex: 1, backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}