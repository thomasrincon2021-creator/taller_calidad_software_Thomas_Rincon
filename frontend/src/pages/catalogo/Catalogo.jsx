import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { obtenerProductos } from '../../services/productoService';

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Inicialización del carrito desde LocalStorage
    const [carrito, setCarrito] = useState(() => {
        try {
            const carritoGuardado = localStorage.getItem('carrito_nowstyle');
            return carritoGuardado ? JSON.parse(carritoGuardado) : [];
        } catch (e) {
            console.error("Error al cargar el carrito de localStorage", e);
            return [];
        }
    });

    const [carritoAbierto, setCarritoAbierto] = useState(false);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const [editandoPerfil, setEditandoPerfil] = useState(false);

    // Selección de tallas por producto { [productoId]: tallaSeleccionada }
    const [tallasSeleccionadas, setTallasSeleccionadas] = useState({});

    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [orden, setOrden] = useState('predeterminado');
    const [ciudadEnvio, setCiudadEnvio] = useState('bogota');
    const [direccion, setDireccion] = useState('');
    const [cupon, setCupon] = useState('');
    const [descuento, setDescuento] = useState(0);
    const [mensajeCupon, setMensajeCupon] = useState({ texto: '', color: '' });

    const navigate = useNavigate();
    const location = useLocation();

    // Estado del usuario inicializado desde LocalStorage
    const [rolUsuario, setRolUsuario] = useState(() => localStorage.getItem('usuarioRol') || 'CLIENTE');
    const [nombreUsuario, setNombreUsuario] = useState(() => localStorage.getItem('usuarioNombre') || 'Usuario NowStyle');
    const [emailUsuario, setEmailUsuario] = useState(() => localStorage.getItem('usuarioEmail') || 'usuario@nowstyle.com');
    const [telefonoUsuario, setTelefonoUsuario] = useState(() => localStorage.getItem('usuarioTelefono') || '');
    const [fotoPerfil, setFotoPerfil] = useState(() => localStorage.getItem('usuarioFoto') || '');

    // Formulario de edición temporal
    const [tempNombre, setTempNombre] = useState(nombreUsuario);
    const [tempEmail, setTempEmail] = useState(emailUsuario);
    const [tempTelefono, setTempTelefono] = useState(telefonoUsuario);
    const [tempFoto, setTempFoto] = useState(fotoPerfil);

    const [fotoNuevaSeleccionada, setFotoNuevaSeleccionada] = useState(false);

    // 2. Persistir el carrito en LocalStorage en cada cambio
    useEffect(() => {
        try {
            localStorage.setItem('carrito_nowstyle', JSON.stringify(carrito));
        } catch (e) {
            console.error("Error al guardar el carrito en localStorage", e);
        }
    }, [carrito]);

    // 3. Capturar retornos de navegación con datos actualizados (Ej. desde PersonalizarEstampado)
    useEffect(() => {
        if (location.state?.productoActualizado) {
            const productoModificado = location.state.productoActualizado;

            setCarrito(prevCarrito => 
                prevCarrito.map(item => 
                    item.cartItemId === productoModificado.cartItemId ? productoModificado : item
                )
            );

            setCarritoAbierto(true);
            window.history.replaceState({}, document.title);
        } else if (location.state?.carritoRestaurado) {
            setCarrito(location.state.carritoRestaurado);
            if (location.state.abrirCarrito) {
                setCarritoAbierto(true);
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Cargar productos y establecer tallas por defecto
    useEffect(() => {
        obtenerProductos()
            .then(data => {
                const prods = data || [];
                setProductos(prods);

                const inicialTallas = {};
                prods.forEach(p => {
                    const tallas = obtenerTallasDisponibles(p.tallasStock);
                    if (tallas.length > 0) {
                        inicialTallas[p.id] = tallas[0];
                    }
                });
                setTallasSeleccionadas(inicialTallas);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando productos:", err);
                setLoading(false);
            });
    }, []);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1.5 * 1024 * 1024) {
                alert("La imagen es muy grande. Por favor elige una de menos de 1.5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result;
                setTempFoto(base64Image);
                setFotoNuevaSeleccionada(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGuardarSoloFoto = async () => {
        const usuarioId = localStorage.getItem('usuarioId');
        if (!usuarioId) {
            alert("No se encontró el ID de usuario.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: nombreUsuario,
                    email: emailUsuario,
                    telefono: telefonoUsuario,
                    foto: tempFoto
                })
            });

            if (response.ok) {
                const data = await response.json();
                const fotoGuardada = data.foto || tempFoto;
                
                setFotoPerfil(fotoGuardada);
                localStorage.setItem('usuarioFoto', fotoGuardada);
                setFotoNuevaSeleccionada(false);
            } else {
                console.error("Error al actualizar la foto en el servidor.");
            }
        } catch (err) {
            console.error("Error de red al guardar la foto:", err);
        }
    };

    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        const usuarioId = localStorage.getItem('usuarioId');
        const fotoAGuardar = tempFoto || fotoPerfil;

        localStorage.setItem('usuarioNombre', tempNombre);
        localStorage.setItem('usuarioEmail', tempEmail);
        localStorage.setItem('usuarioTelefono', tempTelefono);
        if (fotoAGuardar) {
            try {
                localStorage.setItem('usuarioFoto', fotoAGuardar);
            } catch (err) {
                console.error("No se pudo persistir la foto en LocalStorage:", err);
            }
        }

        try {
            const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: tempNombre,
                    email: tempEmail,
                    telefono: tempTelefono,
                    foto: fotoAGuardar
                })
            });

            if (response.ok) {
                const data = await response.json();
                setNombreUsuario(data.usuario || tempNombre);
                setEmailUsuario(data.email || tempEmail);
                setTelefonoUsuario(data.telefono || tempTelefono);
                if (data.foto) {
                    setFotoPerfil(data.foto);
                    localStorage.setItem('usuarioFoto', data.foto);
                }
            }
        } catch (err) {
            console.error("Error al actualizar perfil en BD:", err);
        } finally {
            setNombreUsuario(tempNombre);
            setEmailUsuario(tempEmail);
            setTelefonoUsuario(tempTelefono);
            setFotoPerfil(fotoAGuardar);
            setEditandoPerfil(false);
            setFotoNuevaSeleccionada(false);
        }
    };

    const handleCancelarEdicion = () => {
        setTempNombre(nombreUsuario);
        setTempEmail(emailUsuario);
        setTempTelefono(telefonoUsuario);
        setTempFoto(fotoPerfil);
        setFotoNuevaSeleccionada(false);
        setEditandoPerfil(false);
    };

    const handleCerrarSesion = () => {
        localStorage.clear();
        navigate('/login');
    };

    const obtenerTallasDisponibles = (tallasStockStr) => {
        if (!tallasStockStr || typeof tallasStockStr !== 'string') return [];
        return tallasStockStr
            .split(',')
            .map(item => item.split(':')[0].trim())
            .filter(talla => talla !== '');
    };

    const toggleCarrito = () => setCarritoAbierto(!carritoAbierto);
    const toggleFiltros = () => setFiltrosAbiertos(!filtrosAbiertos);
    const togglePerfil = () => {
        setPerfilAbierto(!perfilAbierto);
        setEditandoPerfil(false);
        setFotoNuevaSeleccionada(false);
        setTempFoto(fotoPerfil);
    };

    const handleCategoriaCheck = (categoria) => {
        const catMin = categoria.toLowerCase().trim();
        if (categoriasSeleccionadas.includes(catMin)) {
            setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c !== catMin));
        } else {
            setCategoriasSeleccionadas([...categoriasSeleccionadas, catMin]);
        }
    };

    const handleCambioTalla = (productoId, talla) => {
        setTallasSeleccionadas(prev => ({ ...prev, [productoId]: talla }));
    };

    const agregarAlCarrito = (producto) => {
        if (!producto) return;

        const prodId = producto.id || producto.idProducto || producto._id;
        if (!prodId) {
            console.error("El producto no tiene un ID válido:", producto);
            return;
        }

        const tallasDisponibles = obtenerTallasDisponibles(producto.tallasStock);
        const talla = (tallasSeleccionadas && tallasSeleccionadas[prodId]) 
            || (tallasDisponibles.length > 0 ? tallasDisponibles[0] : 'Única');

        const cartItemId = `${prodId}-${talla}`;

        setCarrito(prevCarrito => {
            const existente = prevCarrito.find(item => item && item.cartItemId === cartItemId);
            if (existente) {
                return prevCarrito.map(item => 
                    item.cartItemId === cartItemId 
                        ? { ...item, cantidad: item.cantidad + 1 } 
                        : item
                );
            }
            
            return [...prevCarrito, { 
                cartItemId, 
                id: prodId, 
                nombre: producto.nombre || 'Producto sin nombre', 
                precio: Number(producto.precio) || 0, 
                categoria: producto.categoria || '', 
                cantidad: 1, 
                talla: talla, 
                estampado: producto.estampado || null 
            }];
        });

        setCarritoAbierto(true);
    };

    const cambiarCantidad = (cartItemId, delta) => {
        setCarrito(prevCarrito => {
            if (!Array.isArray(prevCarrito)) return [];
            return prevCarrito
                .map(item => {
                    if (item && item.cartItemId === cartItemId) {
                        const nuevaCant = (Number(item.cantidad) || 1) + delta;
                        return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const eliminarDelCarrito = (cartItemId) => {
        setCarrito(carrito.filter(item => item.cartItemId !== cartItemId));
    };

    const aplicarCupon = () => {
        const codigo = cupon.trim().toUpperCase();
        if (codigo === "NOW10") {
            setDescuento(0.10);
            setMensajeCupon({ texto: "¡Cupón NOW10 aplicado! 10% de descuento.", color: "#22c55e" });
        } else if (codigo === "NOW20") {
            setDescuento(0.20);
            setMensajeCupon({ texto: "¡Cupón NOW20 aplicado! 20% de descuento.", color: "#22c55e" });
        } else {
            setDescuento(0);
            setMensajeCupon({ texto: "Cupón inválido o expirado.", color: "#ef4444" });
        }
    };

    // 4. Función finalizarCompra depurada
    const finalizarCompra = async () => {
        if (!direccion.trim()) {
            alert("Por favor ingresa la dirección de envío completa.");
            return;
        }

        const ordenDTO = {
            usuarioEmail: emailUsuario,
            direccionEnvio: direccion,
            ciudadEnvio: ciudadEnvio === 'bogota' ? 'Bogotá' : 'Otras ciudades',
            subtotal: subtotal,
            descuento: valorDescuento,
            costoEnvio: costoEnvio,
            total: totalFinal,
            items: carrito.map(item => {
                const precioBase = Number(item.precio) || 0;
                const extraEstampado = item.estampado && item.estampado.costoExtra ? Number(item.estampado.costoExtra) : 0;
                return {
                    productoId: item.id,
                    nombre: `${item.nombre} (Talla: ${item.talla})`,
                    cantidad: item.cantidad,
                    precioUnitario: precioBase + extraEstampado
                };
            })
        };

        try {
            const response = await fetch('http://localhost:8080/api/pagos/crear-preferencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ordenDTO)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Error en el servidor al generar la preferencia de pago');
            }

            const data = await response.json();
            if (data.initPoint) {
                window.location.href = data.initPoint;
            } else {
                alert("No se pudo obtener el punto de inicio de pago.");
            }
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            alert('No se pudo conectar con el servidor de pagos.');
        }
    };

    const productosFiltrados = productos.filter(p => {
        if (categoriasSeleccionadas.length === 0) return true;
        const catNormalizada = (p.categoria || '').toLowerCase().trim();
        return categoriasSeleccionadas.includes(catNormalizada);
    }).sort((a, b) => {
        if (orden === 'menor-precio') return a.precio - b.precio;
        if (orden === 'mayor-precio') return b.precio - a.precio;
        return 0;
    });

    const subtotal = carrito.reduce((acc, item) => {
        if (!item) return acc;
        const precioBase = Number(item.precio) || 0;
        const extraEstampado = item.estampado && item.estampado.costoExtra ? Number(item.estampado.costoExtra) : 0;
        const cantidadItem = Number(item.cantidad) || 1;
        return acc + (precioBase + extraEstampado) * cantidadItem;
    }, 0);

    const valorDescuento = subtotal * descuento;
    const costoEnvio = subtotal > 0 ? (ciudadEnvio === 'bogota' ? 6000 : 12000) : 0;
    const totalFinal = subtotal - valorDescuento + costoEnvio;

    if (loading) {
        return <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>Cargando tienda... 🚀</div>;
    }

    return (
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff', fontFamily: 'sans-serif', paddingBottom: '4rem' }}>
            
            {/* Header / Navbar */}
            <div style={{ backgroundColor: '#09090b', borderBottom: '1px solid #27272a', padding: '1.2rem 2rem', marginBottom: '2rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
                        Now<span style={{ color: '#dc2626' }}>Style</span> Store
                    </h2>

                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        {(rolUsuario === 'ADMIN' || rolUsuario === 'EMPLEADO') && (
                            <button 
                                onClick={() => navigate('/panel')} 
                                style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.6rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                            >
                                ⚙️ Panel
                            </button>
                        )}
                        <button 
                            onClick={() => navigate('/historial-pedidos')} 
                            style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.6rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                        >
                            📊 Reportes
                        </button>

                        <button onClick={toggleCarrito} style={{ backgroundColor: '#000000', border: '1px solid #27272a', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.6rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                            🛒 Carrito (<span style={{ color: '#dc2626' }}>{carrito.reduce((acc, i) => acc + (Number(i?.cantidad) || 0), 0)}</span>)
                        </button>

                        <div 
                            onClick={togglePerfil} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.6rem', 
                                backgroundColor: '#18181b', 
                                border: '2px solid #dc2626', 
                                boxShadow: '0 0 10px rgba(220, 38, 38, 0.3)',
                                padding: '0.4rem 0.9rem', 
                                borderRadius: '2rem', 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {fotoPerfil ? (
                                <img src={fotoPerfil} alt="Perfil" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #dc2626' }} />
                            ) : (
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' }}>
                                    {nombreUsuario.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff', lineHeight: 1 }}>{nombreUsuario.split(' ')[0]}</span>
                                <span style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 'bold', textTransform: 'uppercase' }}>Mi Perfil</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE PERFIL */}
            {perfilAbierto && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1.25rem', width: '90%', maxWidth: '420px', padding: '2rem', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                        <button onClick={togglePerfil} style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        
                        <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 900, color: '#dc2626', letterSpacing: '1px', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Perfil de Usuario
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '0.75rem' }}>
                                {tempFoto ? (
                                    <img src={tempFoto} alt="Perfil" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #dc2626' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#27272a', border: '2px dashed #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#a1a1aa' }}>
                                        👤
                                    </div>
                                )}
                                <label htmlFor="upload-photo" style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#dc2626', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem', border: '2px solid #09090b' }} title="Cambiar foto">
                                    ✏️
                                </label>
                                <input id="upload-photo" type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />
                            </div>

                            {fotoNuevaSeleccionada && !editandoPerfil && (
                                <button onClick={handleGuardarSoloFoto} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.2rem' }}>
                                    💾 Guardar Nueva Foto
                                </button>
                            )}
                            
                            {!fotoNuevaSeleccionada && (
                                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Haz clic en el lápiz para cambiar la foto</span>
                            )}
                        </div>

                        {!editandoPerfil ? (
                            <div style={{ backgroundColor: '#000000', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 'bold' }}>Nombre Completo</span>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff' }}>{nombreUsuario}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 'bold' }}>Correo Electrónico</span>
                                    <div style={{ fontSize: '0.85rem', color: '#d4d4d8' }}>{emailUsuario}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 'bold' }}>Teléfono</span>
                                    <div style={{ fontSize: '0.85rem', color: '#d4d4d8' }}>{telefonoUsuario || 'Sin registrar'}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 'bold' }}>Rol / Rango</span>
                                    <div>
                                        <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                                            {rolUsuario}
                                        </span>
                                    </div>
                                </div>

                                <button onClick={() => setEditandoPerfil(true)} style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#ffffff', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                                    ✏️ Editar Datos
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleGuardarPerfil} style={{ backgroundColor: '#000000', border: '1px solid #27272a', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Nombre Completo</label>
                                    <input type="text" value={tempNombre} onChange={(e) => setTempNombre(e.target.value)} required style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', color: 'white', padding: '0.5rem', borderRadius: '0.4rem', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Correo Electrónico</label>
                                    <input type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} required style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', color: 'white', padding: '0.5rem', borderRadius: '0.4rem', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>Teléfono</label>
                                    <input type="text" value={tempTelefono} onChange={(e) => setTempTelefono(e.target.value)} placeholder="Ej: 3001234567" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #3f3f46', color: 'white', padding: '0.5rem', borderRadius: '0.4rem', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <button type="submit" style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>Guardar Todo</button>
                                    <button type="button" onClick={handleCancelarEdicion} style={{ flex: 1, backgroundColor: '#27272a', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>Cancelar</button>
                                </div>
                            </form>
                        )}

                        <button onClick={handleCerrarSesion} style={{ width: '100%', backgroundColor: '#27272a', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '0.6rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            {/* BARRA DE HERRAMIENTAS */}
            <div style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
                <button onClick={toggleFiltros} style={{ background: 'none', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    <span style={{ fontSize: '1.1rem', color: '#dc2626' }}>⌥</span> Filtros {categoriasSeleccionadas.length > 0 && `(${categoriasSeleccionadas.length})`}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                        <strong style={{ color: '#ffffff' }}>{productosFiltrados.length}</strong> Productos
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ color: '#a1a1aa', fontSize: '0.85rem', fontWeight: 'bold' }}>ORDENAR:</label>
                        <select value={orden} onChange={(e) => setOrden(e.target.value)} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.4rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            <option value="predeterminado">Predeterminado</option>
                            <option value="menor-precio">Menor Precio</option>
                            <option value="mayor-precio">Mayor Precio</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* PANEL LATERAL DE FILTROS */}
            <div style={{ 
                position: 'fixed', top: 0, left: filtrosAbiertos ? '0' : '-350px', 
                width: '320px', height: '100vh', backgroundColor: '#09090b', 
                borderRight: '1px solid #27272a', transition: 'left 0.3s ease', 
                zIndex: 9999, padding: '1.5rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' 
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Filtros</h3>
                    <button onClick={toggleFiltros} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h4 style={{ color: '#dc2626', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 800 }}>Categorías</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {['Camisetas', 'Hoodies', 'Oversize'].map(cat => {
                                const catMin = cat.toLowerCase();
                                const checkeado = categoriasSeleccionadas.includes(catMin);
                                return (
                                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem', color: checkeado ? '#ffffff' : '#a1a1aa', fontWeight: checkeado ? 'bold' : 'normal' }}>
                                        <input type="checkbox" checked={checkeado} onChange={() => handleCategoriaCheck(cat)} style={{ accentColor: '#dc2626', width: '16px', height: '16px', cursor: 'pointer' }} />
                                        {cat}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {categoriasSeleccionadas.length > 0 && (
                    <div style={{ borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
                        <button onClick={() => setCategoriasSeleccionadas([])} style={{ width: '100%', backgroundColor: '#27272a', color: '#ef4444', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            Limpiar Filtros
                        </button>
                    </div>
                )}
            </div>

            {/* PANEL LATERAL DEL CARRITO */}
            <div style={{ 
                position: 'fixed', top: 0, right: carritoAbierto ? '0' : '-450px', 
                width: '400px', height: '100vh', backgroundColor: '#09090b', 
                borderLeft: '1px solid #27272a', transition: 'right 0.3s ease', 
                zIndex: 9999, padding: '1.5rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' 
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Tu Carrito</h3>
                    <button onClick={toggleCarrito} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                    {carrito.length === 0 ? (
                        <p style={{ color: '#a1a1aa', textAlign: 'center', marginTop: '2rem' }}>Tu carrito está vacío 🛒</p>
                    ) : (
                        carrito.map(item => (
                            <div key={item.cartItemId} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>{item.nombre}</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 'bold' }}>Talla: {item.talla}</span>
                                    </div>
                                    <button onClick={() => eliminarDelCarrito(item.cartItemId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>🗑️</button>
                                </div>

                                <button 
                                    onClick={() => navigate('/personalizar-estampado', { state: { producto: item, carritoActual: carrito } })}
                                    style={{
                                        width: '100%',
                                        backgroundColor: item.estampado ? '#dc2626' : '#09090b',
                                        border: '1px solid #3f3f46',
                                        color: '#ffffff',
                                        padding: '0.45rem 0.6rem',
                                        borderRadius: '0.4rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justify: 'center',
                                        gap: '0.4rem',
                                        margin: '0.2rem 0'
                                    }}
                                >
                                    {item.estampado ? '✨ Estampado Personalizado Aplicado' : '✨ Personaliza tu propio estampado'}
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.3rem', padding: '0.2rem 0.5rem' }}>
                                        <button onClick={() => cambiarCantidad(item.cartItemId, -1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.cantidad}</span>
                                        <button onClick={() => cambiarCantidad(item.cartItemId, 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                                    </div>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        ${((item.precio + (item.estampado ? Number(item.estampado.costoExtra || 0) : 0)) * item.cantidad).toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {carrito.length > 0 && (
                    <div style={{ borderTop: '1px solid #27272a', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" placeholder="Código de Cupón" value={cupon} onChange={(e) => setCupon(e.target.value)} style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.8rem' }} />
                            <button onClick={aplicarCupon} style={{ backgroundColor: '#27272a', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>Aplicar</button>
                        </div>
                        {mensajeCupon.texto && <span style={{ color: mensajeCupon.color, fontSize: '0.75rem', fontWeight: 'bold' }}>{mensajeCupon.texto}</span>}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Envío a:</label>
                            <select value={ciudadEnvio} onChange={(e) => setCiudadEnvio(e.target.value)} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem' }}>
                                <option value="bogota">Bogotá ($6.000)</option>
                                <option value="nacional">Otras ciudades ($12.000)</option>
                            </select>
                        </div>

                        <input type="text" placeholder="Dirección de envío completa" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.8rem' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal:</span>
                                <span>${subtotal.toLocaleString('es-CO')}</span>
                            </div>
                            {descuento > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e' }}>
                                    <span>Descuento:</span>
                                    <span>-${valorDescuento.toLocaleString('es-CO')}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Envío:</span>
                                <span>${costoEnvio.toLocaleString('es-CO')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontWeight: 900, fontSize: '1.1rem', marginTop: '0.5rem', borderTop: '1px solid #27272a', paddingTop: '0.5rem' }}>
                                <span>Total:</span>
                                <span style={{ color: '#dc2626' }}>${totalFinal.toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        <button 
                            style={{ width: '100%', backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '0.6rem', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem' }} 
                            onClick={finalizarCompra}
                        >
                            Finalizar Compra
                        </button>
                    </div>
                )}
            </div>

            {/* GRILLA DE PRODUCTOS */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
                {productosFiltrados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#a1a1aa' }}>
                        <h3>No se encontraron productos en esta categoría</h3>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                        {productosFiltrados.map(producto => {
                            const tallasDisponibles = obtenerTallasDisponibles(producto.tallasStock);
                            const tallaActual = tallasSeleccionadas[producto.id] || (tallasDisponibles[0] || 'Agotado');
                            
                            return (
                                <div key={producto.id} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ width: '100%', height: '280px', backgroundColor: '#18181b', position: 'relative' }}>
                                        {producto.imagenUrl || producto.imagen ? (
                                            <img src={producto.imagenUrl || producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46' }}>Sin Imagen</div>
                                        )}
                                        <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                            {producto.categoria || 'Moda'}
                                        </span>
                                    </div>

                                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{producto.nombre}</h3>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626' }}>
                                            ${producto.precio ? producto.precio.toLocaleString('es-CO') : 0}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <label style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 'bold' }}>Talla:</label>
                                            <select 
                                                value={tallaActual}
                                                onChange={(e) => handleCambioTalla(producto.id, e.target.value)}
                                                disabled={tallasDisponibles.length === 0} 
                                                style={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: 'white', padding: '0.4rem', borderRadius: '0.4rem', fontSize: '0.85rem' }}
                                            >
                                                {tallasDisponibles.length > 0 ? (
                                                    tallasDisponibles.map(t => <option key={t} value={t}>{t}</option>)
                                                ) : (
                                                    <option value="Agotado">Agotado</option>
                                                )}
                                            </select>
                                        </div>

                                        <button 
                                            onClick={() => agregarAlCarrito(producto)}
                                            disabled={tallasDisponibles.length === 0}
                                            style={{ 
                                                width: '100%', 
                                                backgroundColor: tallasDisponibles.length > 0 ? '#ffffff' : '#27272a', 
                                                color: tallasDisponibles.length > 0 ? '#000000' : '#a1a1aa', 
                                                border: 'none', 
                                                padding: '0.65rem', 
                                                borderRadius: '0.5rem', 
                                                fontWeight: 900, 
                                                textTransform: 'uppercase', 
                                                cursor: tallasDisponibles.length > 0 ? 'pointer' : 'not-allowed',
                                                marginTop: 'auto',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {tallasDisponibles.length > 0 ? 'Agregar al Carrito' : 'Agotado'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}