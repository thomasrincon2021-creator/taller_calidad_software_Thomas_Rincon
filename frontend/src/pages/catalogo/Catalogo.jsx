import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProductos } from '../../services/productoService';

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carrito, setCarrito] = useState([]);
    const [carritoAbierto, setCarritoAbierto] = useState(false);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [orden, setOrden] = useState('predeterminado');
    const [ciudadEnvio, setCiudadEnvio] = useState('bogota');
    const [direccion, setDireccion] = useState('');
    const [cupon, setCupon] = useState('');
    const [descuento, setDescuento] = useState(0);
    const [mensajeCupon, setMensajeCupon] = useState({ texto: '', color: '' });
    
    const navigate = useNavigate();
    
    // Leemos el rol del usuario guardado en el localStorage durante el login
    const rolUsuario = localStorage.getItem('usuarioRol');

    useEffect(() => {
        obtenerProductos()
            .then(data => {
                setProductos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando productos:", err);
                setLoading(false);
            });
    }, []);

    const toggleCarrito = () => setCarritoAbierto(!carritoAbierto);
    const toggleFiltros = (estado) => setFiltrosAbiertos(estado);

    const agregarAlCarrito = (producto) => {
        const selectTalla = document.getElementById(`talla-${producto.id}`);
        const talla = selectTalla ? selectTalla.value : 'M';
        const cartItemId = `${producto.id}-${talla}`;

        const existente = carrito.find(item => item.cartItemId === cartItemId);
        if (existente) {
            setCarrito(carrito.map(item => item.cartItemId === cartItemId ? { ...item, cantidad: item.cantidad + 1 } : item));
        } else {
            setCarrito([...carrito, { cartItemId, id: producto.id, nombre: producto.nombre, precio: producto.precio, categoria: producto.categoria || '', cantidad: 1, talla, estampado: null }]);
        }
        setCarritoAbierto(true);
    };

    const cambiarCantidad = (cartItemId, delta) => {
        setCarrito(carrito.map(item => {
            if (item.cartItemId === cartItemId) {
                const nuevaCant = item.cantidad + delta;
                return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
            }
            return item;
        }).filter(Boolean));
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

    const productosFiltrados = productos.filter(p => {
        if (categoriasSeleccionadas.length === 0) return true;
        const cat = (p.categoria || '').toLowerCase().trim();
        return categoriasSeleccionadas.includes(cat);
    }).sort((a, b) => {
        if (orden === 'menor-precio') return a.precio - b.precio;
        if (orden === 'mayor-precio') return b.precio - a.precio;
        return 0;
    });

    const subtotal = carrito.reduce((acc, item) => {
        const extraEstampado = item.estampado ? item.estampado.costoExtra : 0;
        return acc + (item.precio + extraEstampado) * item.cantidad;
    }, 0);

    const valorDescuento = subtotal * descuento;
    const costoEnvio = subtotal > 0 ? (ciudadEnvio === 'bogota' ? 6000 : 12000) : 0;
    const totalFinal = subtotal - valorDescuento + costoEnvio;

    if (loading) {
        return <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando tienda... 🚀</div>;
    }

    return (
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff', fontFamily: 'sans-serif', paddingBottom: '4rem' }}>
            
            <div style={{ backgroundColor: '#09090b', borderBottom: '1px solid #27272a', padding: '1.5rem 2rem', marginBottom: '2rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0 }}>
                        NowStyle <span style={{ color: '#dc2626' }}>Store</span>
                    </h2>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        
                        {/* Botón condicional para Administradores o Empleados */}
                        {(rolUsuario === 'ADMIN' || rolUsuario === 'EMPLEADO') && (
                            <button 
                                onClick={() => navigate('/crear-producto')} 
                                style={{ backgroundColor: '#22c55e', border: 'none', color: 'white', padding: '0.7rem 1.25rem', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                + Nuevo Producto
                            </button>
                        )}

                        <button onClick={toggleCarrito} style={{ backgroundColor: '#000000', border: '1px solid #27272a', color: 'white', padding: '0.7rem 1.25rem', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            🛒 Carrito (<span style={{ color: '#dc2626' }}>{carrito.reduce((acc, i) => acc + i.cantidad, 0)}</span>)
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
                <button onClick={() => toggleFiltros(true)} style={{ background: 'none', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    <span style={{ fontSize: '1.1rem', color: '#dc2626' }}>⌥</span> Mostrar Filtros
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', padding: '0 2rem' }}>
                {productosFiltrados.map(producto => {
                    let tallasArray = ['M', 'L', 'S'];
                    if (producto.tallas) {
                        const limpia = producto.tallas.replace(/["'[\] ]/g, '');
                        tallasArray = limpia ? limpia.split('-') : ['M'];
                    }

                    return (
                        <div key={producto.id} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ backgroundColor: '#000', height: '180px', borderRadius: '0.75rem', border: '1px solid #18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#4b5563', fontWeight: 'bold', fontSize: '0.8rem' }}>{producto.nombre}</span>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>{producto.nombre}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '0 0 1rem 0' }}>{producto.descripcion}</p>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>TALLA:</label>
                                <select id={`talla-${producto.id}`} style={{ backgroundColor: '#000000', border: '1px solid #27272a', color: '#fff', padding: '0.4rem', width: '100%', borderRadius: '0.5rem', fontWeight: 'bold' }}>
                                    {tallasArray.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div style={{ borderTop: '1px solid #18181b', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 900 }}>$ {Number(producto.precio).toLocaleString('es-CO')}</span>
                                <button onClick={() => agregarAlCarrito(producto)} style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                    + Carrito
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ position: 'fixed', top: 0, right: carritoAbierto ? '0' : '-400px', width: '380px', height: '100vh', backgroundColor: '#09090b', borderLeft: '1px solid #27272a', transition: 'right 0.3s ease', zIndex: 9999, padding: '1.5rem', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>Tu Carrito</h3>
                    <button onClick={toggleCarrito} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                    {carrito.map(item => (
                        <div key={item.cartItemId} style={{ backgroundColor: '#000000', border: '1px solid #27272a', padding: '0.85rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>{item.nombre}</p>
                                    <p style={{ color: '#dc2626', margin: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>Talla: {item.talla}</p>
                                    <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.8rem' }}>$ {item.precio.toLocaleString('es-CO')}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <button onClick={() => cambiarCantidad(item.cartItemId, -1)} style={{ backgroundColor: '#27272a', color: 'white', border: 'none', width: '25px', height: '25px', cursor: 'pointer' }}>-</button>
                                    <span style={{ fontWeight: 'bold' }}>{item.cantidad}</span>
                                    <button onClick={() => cambiarCantidad(item.cartItemId, 1)} style={{ backgroundColor: '#27272a', color: 'white', border: 'none', width: '25px', height: '25px', cursor: 'pointer' }}>+</button>
                                    <button onClick={() => eliminarDelCarrito(item.cartItemId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ backgroundColor: '#000', border: '1px solid #27272a', padding: '1rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    <select value={ciudadEnvio} onChange={(e) => setCiudadEnvio(e.target.value)} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.4rem', borderRadius: '0.25rem' }}>
                        <option value="bogota">Bogotá ($6.000)</option>
                        <option value="otras">Otras Ciudades ($12.000)</option>
                    </select>
                    <input type="text" placeholder="Dirección de envío" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.4rem', borderRadius: '0.25rem' }} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" placeholder="Cupón" value={cupon} onChange={(e) => setCupon(e.target.value)} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.4rem', flexGrow: '1', borderRadius: '0.25rem' }} />
                        <button onClick={aplicarCupon} style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '0 0.75rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '0.25rem' }}>Aplicar</button>
                    </div>
                    {mensajeCupon.texto && <div style={{ fontSize: '0.75rem', color: mensajeCupon.color }}>{mensajeCupon.texto}</div>}
                </div>

                <div style={{ borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>
                        <span>TOTAL:</span> <span>$ {totalFinal.toLocaleString('es-CO')}</span>
                    </div>
                    <button onClick={() => alert('Compra procesada con éxito 🚀')} style={{ width: '100%', backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Finalizar Compra
                    </button>
                </div>
            </div>

        </div>
    );
}