import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';

export default function Login() {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: identificador, // El backend procesa correo o usuario
          password
        }),
      });

      if (response.ok) {
        const usuarioLogueado = await response.json();
        
        // 1. Limpiar rastro de sesiones previas
        localStorage.clear();

        // 2. Mapear exacto con los nombres de atributo de la entidad Usuario (Java)
        localStorage.setItem('usuarioRol', usuarioLogueado.rol || 'CLIENTE');
        localStorage.setItem('usuarioNombre', usuarioLogueado.usuario || usuarioLogueado.email || 'Usuario');
        localStorage.setItem('usuarioEmail', usuarioLogueado.email || identificador);
        localStorage.setItem('usuarioTelefono', usuarioLogueado.telefono || 'No registrado');

        if (usuarioLogueado.id) {
          localStorage.setItem('usuarioId', usuarioLogueado.id);
        }

        // 3. Redirigir al catálogo
        navigate('/catalogo');
      } else {
        const errorMsg = await response.text();
        setError(errorMsg || 'Credenciales incorrectas.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor backend.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div className="auth-header">
          <h2 className="auth-title">
            Now<span>Style</span>
          </h2>
          <p className="auth-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-group">
            <label>Usuario o Correo</label>
            <input 
              type="text" 
              value={identificador} 
              onChange={(e) => setIdentificador(e.target.value)} 
              required
              placeholder="Tu usuario o correo"
            />
          </div>

          <div className="auth-group">
            <label>Contraseña</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <input 
                type={mostrarPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'transparent', border: 'none', color: '#ffffff', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', padding: '0 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Entrar
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '1.5rem' }}>
          <Link to="/">← Volver</Link>
          <Link to="/recuperar-password" style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>¿Olvidaste tu contraseña?</Link>
          <Link to="/register" style={{ color: '#dc2626', fontWeight: 'bold' }}>Crear cuenta</Link>
        </div>

      </div>
    </div>
  );
}