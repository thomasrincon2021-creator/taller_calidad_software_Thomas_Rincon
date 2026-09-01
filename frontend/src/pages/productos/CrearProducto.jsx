import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

export default function CrearProducto() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Camisetas');
  const [color, setColor] = useState('Negro');
  const [precio, setPrecio] = useState('');

  const tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const [stockPorTalla, setStockPorTalla] = useState({});

  const [imagenBase64, setImagenBase64] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleTallaToggle = (talla) => {
    setStockPorTalla(prev => {
      const nuevo = { ...prev };
      if (nuevo[talla] !== undefined) {
        delete nuevo[talla];
      } else {
        nuevo[talla] = '';
      }
      return nuevo;
    });
  };

  const handleCantidadChange = (talla, valor) => {
    setStockPorTalla(prev => ({
      ...prev,
      [talla]: valor
    }));
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setNombreArchivo(archivo.name);
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
          setImagenBase64(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      lector.readAsDataURL(archivo);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const precioNum = parseFloat(precio);

    if (!nombre.trim() || isNaN(precioNum)) {
      mostrarMensaje('Completa el nombre y el precio.', 'error');
      return;
    }

    if (Object.keys(stockPorTalla).length === 0) {
      mostrarMensaje('Selecciona al menos una talla y su cantidad.', 'error');
      return;
    }

    if (!imagenBase64) {
      mostrarMensaje('Selecciona una imagen.', 'error');
      return;
    }

    const tallasStockTexto = Object.entries(stockPorTalla)
      .map(([talla, cantidad]) => `${talla}: ${cantidad || 0}`)
      .join(', ');

    const productoData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || 'Diseño exclusivo.',
      categoria,
      color: color.trim() || 'Estándar',
      precio: precioNum,
      tallasStock: tallasStockTexto,
      imagen: imagenBase64
    };

    fetch('http://localhost:8080/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData),
    })
      .then(res => res.json())
      .then(() => {
        mostrarMensaje('¡Prenda guardada con éxito!', 'exito');
        limpiarFormulario();
      })
      .catch(() => {
        mostrarMensaje('Error al guardar en el servidor.', 'error');
      });
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStockPorTalla({});
    setImagenBase64('');
    setNombreArchivo('');
    setColor('Negro');
    setCategoria('Camisetas');
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 900 }}>NOWSTYLE</h1>
          <p style={{ margin: 0, color: '#a1a1aa' }}>Gestión de Prendas • Control por Tallas</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/panel')} style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Panel
          </button>
          <button onClick={() => navigate('/inventario')} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            🛍️ Ver Inventario Activo
          </button>
        </div>
      </header>

      {mensaje.texto && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: mensaje.tipo === 'exito' ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 'bold' }}>
          {mensaje.texto}
        </div>
      )}

      <main style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1rem', padding: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #18181b', paddingBottom: '0.75rem' }}>✨ Nueva Prenda</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a1a1aa', fontWeight: 'bold' }}>Nombre de la Prenda *</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Camiseta Oversize" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a1a1aa', fontWeight: 'bold' }}>Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a1a1aa', fontWeight: 'bold' }}>Tipo de Prenda</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff' }}>
                <option value="Camisetas">Camisetas</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Oversize">Oversize</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a1a1aa', fontWeight: 'bold' }}>Color Base</label>
              <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="Negro" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a1a1aa', fontWeight: 'bold' }}>1. Selecciona Tallas Disponibles:</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {tallasDisponibles.map((talla) => {
                const seleccionada = stockPorTalla[talla] !== undefined;
                return (
                  <button
                    type="button"
                    key={talla}
                    onClick={() => handleTallaToggle(talla)}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      backgroundColor: seleccionada ? '#dc2626' : '#18181b',
                      color: '#fff',
                      border: '1px solid #27272a',
                      borderRadius: '0.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {talla}
                  </button>
                );
              })}
            </div>

            {Object.keys(stockPorTalla).length > 0 && (
              <div style={{ background: '#18181b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #27272a' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#a1a1aa', display: 'block', marginBottom: '0.5rem' }}>2. Ingresa stock por talla:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {Object.keys(stockPorTalla).map((talla) => (
                    <div key={talla} style={{ flex: '1 1 80px' }}>
                      <span style={{ fontSize: '12px', display: 'block', color: '#fff', marginBottom: '0.2rem' }}>Talla {talla}</span>
                      <input
                        type="number"
                        min="0"
                        value={stockPorTalla[talla]}
                        onChange={e => handleCantidadChange(talla, e.target.value)}
                        placeholder="0"
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a1a1aa', fontWeight: 'bold' }}>Precio de Venta (COP) *</label>
            <input type="number" step="1000" min="1000" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Ej. 45000" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #27272a', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a1a1aa', fontWeight: 'bold' }}>Fotografía *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label htmlFor="file-input" style={{ backgroundColor: '#27272a', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid #3f3f46', fontWeight: 'bold' }}>
                📁 Seleccionar Archivo
              </label>
              <input id="file-input" type="file" accept="image/*" onChange={handleImagenChange} style={{ display: 'none' }} />
              <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{nombreArchivo || 'Ningún archivo cargado'}</span>
            </div>
            {imagenBase64 && (
              <div style={{ marginTop: '1rem' }}>
                <img src={imagenBase64} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #27272a' }} />
              </div>
            )}
          </div>

          <button type="submit" style={{ marginTop: '1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            + Publicar en el Catálogo
          </button>
        </form>
      </main>
    </div>
  );
}