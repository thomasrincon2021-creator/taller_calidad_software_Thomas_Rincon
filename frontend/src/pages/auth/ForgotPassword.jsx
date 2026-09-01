import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // Paso 1: Pedir email, Paso 2: Código y nueva contraseña
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Paso 1: Enviar correo para recibir código
  const handleEnviarCorreo = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const dataText = await response.text();

      if (!response.ok) {
        // Puedes verificar si el mensaje del backend o el status indican que no existe
        // O directamente forzar un mensaje amigable para cuando el correo no se encuentra:
        if (response.status === 404 || dataText.includes('El correo') || dataText.includes('not found')) {
          throw new Error('El correo electrónico ingresado no existe.');
        } else {
          throw new Error(dataText || 'No se pudo procesar la solicitud.');
        }
      }

      setMensaje('¡Código enviado! Revisa la bandeja de tu correo electronico.');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Validar código y actualizar contraseña
  const handleActualizarPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/usuarios/actualizar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nuevaPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error al actualizar la contraseña.');
      }

      setMensaje('¡Contraseña actualizada con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Recuperar <span>Contraseña</span></h2>
          <p className="auth-subtitle">
            {step === 1 ? 'Ingresa tu correo para recibir el código' : 'Ingresa el código y tu nueva contraseña'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#7f1d1d', color: '#f87171', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {mensaje && (
          <div style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>
            {mensaje}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleEnviarCorreo} className="auth-form">
            <div className="auth-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="tucorreo@gmail.com"
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleActualizarPassword} className="auth-form">
            <div className="auth-group">
              <label>Código de Verificación</label>
              <input 
                type="text" 
                value={codigo} 
                onChange={(e) => setCodigo(e.target.value)} 
                required 
                placeholder="Ej: 123456"
                style={{ letterSpacing: '2px' }}
              />
            </div>

            <div className="auth-group">
              <label>Nueva Contraseña</label>
              <input 
                type="password" 
                value={nuevaPassword} 
                onChange={(e) => setNuevaPassword(e.target.value)} 
                required 
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">Volver al Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}