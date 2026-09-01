import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

export default function ProductosAdmin() {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">Now<span>Style</span> Store</div>
        <div className="nav-links">
          <a href="#catalogo" style={{ color: '#a1a1aa', fontWeight: 700, marginRight: '1rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Catálogo</a>
          <Link to="/login" className="btn-nav-outline">Ya tengo cuenta</Link>
          <Link to="/register" className="btn-nav-primary">Registrarse</Link>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-bg-split">
          <div className="hero-split-left"></div>
          <div className="hero-split-right"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">NOW<br />STYLE<br />STORE</h1>
          <p className="hero-subtitle">Tu Estilo, Tu Identidad, Tu Marca</p>

          <div className="hero-buttons">
            <a href="#catalogo" className="btn-hero-primary">🔥 Ver Catálogo</a>
            <Link to="/register" className="btn-hero-outline">Registrarse</Link>
          </div>
        </div>
      </section>

      <section className="products-section" id="catalogo">
        <h2 className="section-title">Nuestra Colección</h2>
        
        <div className="products-grid">
          
          <div className="product-card">
            <div className="product-image-wrapper">
              <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80" alt="Oversized Hoodie" />
              <span className="badge-sale">Oferta</span>
            </div>
            <div className="product-info">
              <div className="product-name">Oversized Hoodie Premium</div>
              <div className="product-prices">
                <span className="old-price">$67.000</span>
                <span className="current-price">$45.000</span>
              </div>
            </div>
          </div>

          <div className="product-card">
            <div className="product-image-wrapper">
              <img src="https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80" alt="Street Jacket" />
              <span className="badge-sale">Oferta</span>
            </div>
            <div className="product-info">
              <div className="product-name">Street Jacket Essential</div>
              <div className="product-prices">
                <span className="old-price">$67.000</span>
                <span className="current-price">$45.000</span>
              </div>
            </div>
          </div>

          <div className="product-card">
            <div className="product-image-wrapper">
              <img src="https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80" alt="Urban Hoodie" />
              <span className="badge-sale">Popular</span>
            </div>
            <div className="product-info">
              <div className="product-name">Urban Hoodie Signature</div>
              <div className="product-prices">
                <span className="old-price">$67.000</span>
                <span className="current-price">$56.000</span>
              </div>
            </div>
          </div>

          <div className="product-card">
            <div className="product-image-wrapper">
              <img src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80" alt="Pantalon Baggy" />
            </div>
            <div className="product-info">
              <div className="product-name">Pantalon Baggy</div>
              <div className="product-prices">
                <span className="old-price">$120.000</span>
                <span className="current-price">$100.000</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">Now<span>Style</span> Store</div>
        <div className="footer-copy">&copy; 2026 NowStyle Store. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}