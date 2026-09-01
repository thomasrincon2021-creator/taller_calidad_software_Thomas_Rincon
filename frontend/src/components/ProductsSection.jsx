import React, { useState, useEffect } from 'react';
import { obtenerProductos } from '../../services/productoService';

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerProductos()
            .then(data => {
                setProductos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando catálogo:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="auth-container">
                <p style={{ color: '#a1a1aa', fontWeight: 'bold' }}>Cargando catálogo desde Spring Boot... 🚀</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', paddingTop: '80px' }}>
            <nav className="navbar">
                <div className="navbar-logo">Now<span>Style</span></div>
                <div className="nav-links">
                    <button className="btn-nav-outline" onClick={() => alert('Carrito')}>🛒 Carrito</button>
                </div>
            </nav>

            <section className="products-section">
                <h2 className="section-title">Catálogo de Productos ({productos.length})</h2>

                <div className="products-grid">
                    {productos.map(producto => (
                        <div className="product-card" key={producto.id}>
                            <div className="product-image-wrapper">
                                <span className="placeholder-img">NowStyle</span>
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{producto.nombre}</h3>
                                <p style={{ color: '#71717a', fontSize: '0.8rem', marginBottom: '1rem' }}>
                                    {producto.descripcion}
                                </p>
                                <div className="product-prices">
                                    <span className="current-price">$ {Number(producto.precio).toLocaleString('es-CO')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}