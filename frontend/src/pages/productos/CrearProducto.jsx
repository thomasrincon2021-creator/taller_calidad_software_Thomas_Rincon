import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

export default function CrearProducto() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [color, setColor] = useState('');
  const [precio, setPrecio] = useState('');
  const [tallasStock, setTallasStock] = useState('');
  const [imagen, setImagen] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre,
      descripcion,
      categoria,
      color,
      precio: parseFloat(precio),
      tallasStock,
      imagen
    };

    try {
      const respuesta = await fetch('http://localhost:8080/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoProducto),
      });

      if (respuesta.ok) {
        alert('¡Producto guardado exitosamente! 🚀');
        navigate('/catalogo');
      } else {
        alert('Hubo un error al guardar el producto.');
      }
    } catch (error) {
      console.error('Error enviando la petición:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">Now<span>Style</span> Admin</div>
        <div className="nav-links">
          <button onClick={() => navigate('/catalogo')} className="btn-nav-outline" style={{ background: 'none', cursor: 'pointer' }}>
            Volver al Catálogo
          </button>
        </div>
      </nav>

      <div className="auth-container" style={{ paddingTop: '5rem' }}>
        <div className="auth-card" style={{ maxWidth: '550px' }}>
          
          <div className="auth-header">
            <h1 className="auth-title">CREAR <span>PRODUCTO</span></h1>
            <p className="auth-subtitle">Ingresa la información para el catálogo</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group">
              <label>Nombre del Producto</label>
              <input 
                type="text" 
                placeholder="Ej. Oversized Hoodie Premium" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
            </div>

            <div className="auth-group">
              <label>Descripción</label>
              <input 
                type="text" 
                placeholder="Ej. Tela algodón perchado 100%" 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="auth-group">
                <label>Categoría</label>
                <input 
                  type="text" 
                  placeholder="Ej. hoodies" 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value)} 
                />
              </div>

              <div className="auth-group">
                <label>Color</label>
                <input 
                  type="text" 
                  placeholder="Ej. Negro" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="auth-group">
                <label>Precio ($)</label>
                <input 
                  type="number" 
                  placeholder="Ej. 45000" 
                  value={precio} 
                  onChange={(e) => setPrecio(e.target.value)} 
                  required 
                />
              </div>

              <div className="auth-group">
                <label>Tallas / Stock</label>
                <input 
                  type="text" 
                  placeholder="Ej. S-M-L" 
                  value={tallasStock} 
                  onChange={(e) => setTallasStock(e.target.value)} 
                />
              </div>
            </div>

            <div className="auth-group">
              <label>URL Imagen</label>
              <input 
                type="text" 
                placeholder="https://images.unsplash.com/..." 
                value={imagen} 
                onChange={(e) => setImagen(e.target.value)} 
              />
            </div>

            <button type="submit" className="auth-button">
              Guardar en Inventario
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}