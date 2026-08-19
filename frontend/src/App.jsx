import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [vista, setVista] = useState('login');
  const [usuarioInput, setUsuarioInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState('');

  // Estados de Productos (CRUD)
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [tipo, setTipo] = useState(''); // Nuevo estado para el tipo de producto
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const API_PRODUCTOS = 'http://localhost:8082/api/productos';
  const API_USUARIOS = 'http://localhost:8082/api/usuarios';

  useEffect(() => {
    if (vista === 'dashboard') {
      cargarProductos();
    }
  }, [vista]);

  const cargarProductos = async () => {
    try {
      const res = await fetch(API_PRODUCTOS);
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos del servidor.");
    }
  };

  // Validación profesional: Mínimo 3 letras, min 4 caracteres de usuario. Contraseña con mayúscula, minúscula, número y min 8 chars.
  const validarCredenciales = (usuario, password) => {
    const regexUsuario = /^(?=(?:[^a-zA-Z]*[a-zA-Z]){3})[a-zA-Z0-9_]{4,}$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!regexUsuario.test(usuario)) {
      alert("⚠️ Usuario no válido.\nDebe tener al menos 4 caracteres y contener obligatoriamente un mínimo de 3 letras.");
      return false;
    }

    if (!regexPassword.test(password)) {
      alert("⚠️ Contraseña no segura.\nDebe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula y un número.");
      return false;
    }

    return true;
  };

  // CONEXIÓN REAL AL LOGIN DE JAVA
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validarCredenciales(usuarioInput, passwordInput)) return;

    try {
      const response = await fetch(`${API_USUARIOS}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ usuario: usuarioInput, password: passwordInput })
      });

      if (response.ok) {
        setUsuarioLogueado(usuarioInput);
        setVista('dashboard');
      } else {
        const errorTexto = await response.text();
        alert("❌ Error del servidor: " + errorTexto);
      }
    } catch (error) {
      console.error("Error de red detallado:", error);
      alert("No se pudo conectar con el servidor backend de Java en el puerto 8080. Revisa que siga encendido.");
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!validarCredenciales(usuarioInput, passwordInput)) return;

    try {
      const response = await fetch(`${API_USUARIOS}/registro`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ usuario: usuarioInput, password: passwordInput })
      });

      if (response.ok) {
        alert("✅ ¡Registro exitoso en la base de datos! Ahora puedes iniciar sesión.");
        setVista('login');
        setUsuarioInput('');
        setPasswordInput('');
      } else {
        const errorTexto = await response.text();
        alert("⚠️ " + (errorTexto || "El usuario ya existe en la base de datos."));
      }
    } catch (error) {
      console.error("Error de red detallado:", error);
      alert("No se pudo conectar con el servidor backend de Java en el puerto 8080. Revisa que siga encendido.");
    }
  };

  const guardarOActualizarProducto = async (e) => {
    e.preventDefault();
    const productoData = { 
      nombre, 
      precio: parseFloat(precio), 
      stock: parseInt(stock), 
      tipo // Se incluye el tipo de producto
    };

    try {
      if (editandoId) {
        await fetch(`${API_PRODUCTOS}/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoData)
        });
      } else {
        await fetch(API_PRODUCTOS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productoData)
        });
      }

      setNombre('');
      setPrecio('');
      setStock('');
      setTipo('');
      setEditandoId(null);
      setMostrarFormulario(false);
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const prepararEdicion = (p) => {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setPrecio(p.precio);
    setStock(p.stock);
    setTipo(p.tipo || ''); // Carga el tipo existente si lo tiene
    setMostrarFormulario(true);
  };

  const eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await fetch(`${API_PRODUCTOS}/${id}`, { method: 'DELETE' });
        cargarProductos();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // 1. VISTA DE LOGIN
  if (vista === 'login') {
    return (
      <div className="login-container">
        <form className="login-box" onSubmit={handleLogin}>
          <h2>Iniciar Sesión</h2>
          
          <label style={{ fontSize: '0.80rem', color: '#a1a1aa' }}>Usuario (Mín. 4 chars, 3 letras)</label>
          <input className="input-field" type="text" placeholder="Ej. AdminSena" value={usuarioInput} onChange={e => setUsuarioInput(e.target.value)} required />
          
          <label style={{ fontSize: '0.80rem', color: '#a1a1aa' }}>Contraseña (Mayús, minús, número, 8 chars)</label>
          <div style={{ position: 'relative' }}>
            <input className="input-field" type={mostrarPassword ? "text" : "password"} placeholder="Ej. Clave2026" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required />
            <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.8rem' }}>
              {mostrarPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          
          <button className="btn-red" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Ingresar</button>
          
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
            ¿No tienes cuenta? <span onClick={() => { setVista('registro'); setUsuarioInput(''); setPasswordInput(''); }} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Regístrate aquí</span>
          </p>
        </form>
      </div>
    );
  }

  // 2. VISTA DE REGISTRO
  if (vista === 'registro') {
    return (
      <div className="login-container">
        <form className="login-box" onSubmit={handleRegistro}>
          <h2>Crear Cuenta</h2>
          
          <label style={{ fontSize: '0.80rem', color: '#a1a1aa' }}>Nuevo Usuario</label>
          <input className="input-field" type="text" placeholder="Ej. Supervisor01" value={usuarioInput} onChange={e => setUsuarioInput(e.target.value)} required />
          
          <label style={{ fontSize: '0.80rem', color: '#a1a1aa' }}>Contraseña Profesional</label>
          <div style={{ position: 'relative' }}>
            <input className="input-field" type={mostrarPassword ? "text" : "password"} placeholder="Ej. Clave2026" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required />
            <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.8rem' }}>
              {mostrarPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          
          <button className="btn-red" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Registrarse</button>
          
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
            ¿Ya tienes cuenta? <span onClick={() => { setVista('login'); setUsuarioInput(''); setPasswordInput(''); }} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Inicia sesión</span>
          </p>
        </form>
      </div>
    );
  }

  // 3. DASHBOARD Y CRUD DE PRODUCTOS Y TIPOS
  return (
    <div>
      <header className="header">
        <div className="header-content">
          <h1 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
            Hola profesor({usuarioLogueado})
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-red" onClick={() => { setEditandoId(null); setNombre(''); setPrecio(''); setStock(''); setTipo(''); setMostrarFormulario(!mostrarFormulario); }}>
              {mostrarFormulario ? 'Cancelar' : 'Crear Producto'}
            </button>
            <button className="btn-secondary" onClick={() => setVista('login')}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {mostrarFormulario && (
        <div className="form-container">
          <form className="form-box" onSubmit={guardarOActualizarProducto}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1rem', color: '#a1a1aa' }}>
              {editandoId ? 'Editar Producto y Tipo' : 'Nuevo Producto y Tipo'}
            </h3>
            <input className="input-field" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
            <input className="input-field" placeholder="Precio" type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} required />
            <input className="input-field" placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
            
            {/* Selector de Tipo de Producto */}
            <select className="input-field" value={tipo} onChange={e => setTipo(e.target.value)} required style={{ background: '#18181b', color: 'white' }}>
              <option value="">Seleccione un Tipo de Producto</option>
              <option value="Frutas">Fruta</option>
              <option value="Vegetales">Vegetal</option>
            </select>

            <button className="btn-red" type="submit">
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="grid-container">
        {productos.map(p => (
          <div key={p.id} className="product-card">
            <div className="border-line"></div>
            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>ID: #{p.id}</span>
            <h3 style={{ margin: '0.5rem 0', textTransform: 'uppercase', fontSize: '1.1rem' }}>{p.nombre}</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>${p.precio}</p>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '0 0 0.5rem 0' }}>Stock: {p.stock}</p>
            <p style={{ fontSize: '0.85rem', color: '#38bdf8', margin: '0 0 1rem 0', fontWeight: '600' }}>Tipo: {p.tipo || 'Normal'}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => prepararEdicion(p)}>Editar</button>
              <button className="btn-red" style={{ flex: 1 }} onClick={() => eliminarProducto(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}

        {productos.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#71717a', padding: '3rem', textTransform: 'uppercase' }}>
            No hay productos registrados en la base de datos.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;