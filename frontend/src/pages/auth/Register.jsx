import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';

export default function Register() {
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para controlar la visibilidad de la contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estados para controlar el paso del código de verificación
  const [pasoVerificacion, setPasoVerificacion] = useState(false);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setError('');

    const telClean = telefono.replace(/\D/g, '');
    if (!/^3\d{9}$/.test(telClean)) {
      setError('El celular debe tener 10 dígitos y empezar por 3.');
      return;
    }

    const telefonoCompleto = `+57 ${telClean}`;

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, email, telefono: telefonoCompleto, password }),
      });

      if (response.ok) {
        setPasoVerificacion(true);
      } else {
        const errorData = await response.text();
        setError(errorData || 'Error al solicitar el código.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor backend.');
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError('');

    const telClean = telefono.replace(/\D/g, '');
    const telefonoCompleto = `+57 ${telClean}`;

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/verificar-registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          codigo: codigoIngresado,
          usuarioData: { usuario, email, telefono: telefonoCompleto, password }
        }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.text();
        setError(errorData || 'Código incorrecto.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al verificar el código.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Now<span>Style</span></h2>
          <p className="auth-subtitle">
            {pasoVerificacion ? 'Ingresa el código de la consola' : 'Crea tu nueva cuenta'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!pasoVerificacion ? (
          <form onSubmit={handleSolicitarCodigo} className="auth-form">
            <div className="auth-group">
              <label>Usuario</label>
              <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required placeholder="Ej: JuanPerez99" />
            </div>

            <div className="auth-group">
              <label>Correo Electrónico (Gmail)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tucorreo@gmail.com" />
            </div>

            <div className="auth-group">
              <label>Número de Teléfono</label>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <span style={{ padding: '0 0.75rem', color: '#e4e4e7', fontSize: '0.9rem', borderRight: '1px solid #27272a' }}>🇨🇴 +57</span>
                <input type="tel" maxLength="10" value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))} required placeholder="3001234567" style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'transparent', border: 'none', color: '#ffffff', outline: 'none' }} />
              </div>
            </div>

            <div className="auth-group">
              <label>Contraseña</label>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <input 
                  type={mostrarPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Mínimo 8 caracteres" 
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

            <button type="submit" className="auth-button">Continuar y Verificar</button>
          </form>
        ) : (
          <form onSubmit={handleVerificarCodigo} className="auth-form">
            <div className="auth-group">
              <label>Código de Verificación enviado a tu gmail</label>
              <input type="text" maxLength="6" value={codigoIngresado} onChange={(e) => setCodigoIngresado(e.target.value)} required placeholder="123456" style={{ textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.2rem' }} />
            </div>
            <button type="submit" className="auth-button">Confirmar Registro</button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/">← Volver al catálogo</Link>
        </div>
      </div>
    </div>
  );
}