import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Reportes() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensajes, setMensajes] = useState({});
    const [nuevoMensaje, setNuevoMensaje] = useState({});

    const emailUsuario = localStorage.getItem('usuarioEmail') || '';
    const rolUsuario = localStorage.getItem('usuarioRol') || 'CLIENTE';

    useEffect(() => {
        const obtenerHistorial = async () => {
            try {
                // Si es ADMIN o EMPLEADO obtiene todos los pedidos, si no, solo los del cliente actual
                const endpoint = (rolUsuario === 'ADMIN' || rolUsuario === 'EMPLEADO')
                    ? 'http://localhost:8080/api/pedidos'
                    : `http://localhost:8080/api/pedidos/usuario/${emailUsuario}`;

                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    setPedidos(data);
                    data.forEach(pedido => cargarMensajes(pedido.id));
                }
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerHistorial();
    }, [emailUsuario, rolUsuario]);

    const cargarMensajes = async (pedidoId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/mensajes`);
            if (response.ok) {
                const data = await response.json();
                setMensajes(prev => ({ ...prev, [pedidoId]: data }));
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        }
    };

    const enviarMensaje = async (pedidoId) => {
        const texto = (nuevoMensaje[pedidoId] || '').trim();
        if (!texto) return;

        try {
            const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: texto, autorEmail: emailUsuario, rolAutor: rolUsuario })
            });
            if (response.ok) {
                setNuevoMensaje(prev => ({ ...prev, [pedidoId]: '' }));
                cargarMensajes(pedidoId);
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    };

    const enviarMensajeTexto = async (pedidoId, texto) => {
        const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/mensajes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: texto, autorEmail: emailUsuario, rolAutor: rolUsuario })
        });
        if (response.ok) cargarMensajes(pedidoId);
    };

    const actualizarEstado = async (pedidoId, estado, mensaje) => {
        try {
            const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado })
            });
            if (response.ok) {
                setPedidos(prev => prev.map(pedido => pedido.id === pedidoId ? { ...pedido, estado } : pedido));
                enviarMensajeTexto(pedidoId, mensaje);
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
        }
    };

    return (
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#ffffff', fontFamily: 'sans-serif', padding: '2rem' }}>
            {/* Encabezado */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0 }}>
                    📊 {rolUsuario === 'ADMIN' || rolUsuario === 'EMPLEADO' ? 'Reporte General de Ventas' : 'Mis Compras y Pedidos'}
                </h2>
                <button 
                    onClick={() => navigate('/catalogo')} 
                    style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.6rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Volver al Catálogo
                </button>
            </div>

            {/* Listado de Pedidos */}
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {cargando ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center' }}>Cargando historial de pedidos...</p>
                ) : pedidos.length === 0 ? (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
                        <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>No se encontraron compras o pedidos registrados.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {pedidos.map((pedido) => (
                            <div key={pedido.id} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.8rem', padding: '1.5rem' }}>
                                
                                {/* Cabecera de la tarjeta del pedido */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #18181b', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '1.1rem' }}>Pedido #{pedido.id}</span>
                                        <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                            {pedido.fecha ? new Date(pedido.fecha).toLocaleString() : 'Reciente'}
                                        </span>
                                    </div>
                                    <span style={{ 
                                        backgroundColor: pedido.estado === 'APROBADO' ? '#15803d' : '#b45309', 
                                        color: 'white', 
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '0.4rem', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 'bold' 
                                    }}>
                                        {pedido.estado || 'PENDIENTE'}
                                    </span>
                                </div>

                                {/* Datos del Cliente y Envío */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#d4d4d8' }}>
                                    <p style={{ margin: 0 }}><strong>Usuario:</strong> {pedido.usuarioEmail}</p>
                                    <p style={{ margin: 0 }}><strong>Ciudad / Dirección:</strong> {pedido.ciudadEnvio} - {pedido.direccionEnvio}</p>
                                </div>

                                {/* Detalle de Items Comprados */}
                                <div style={{ backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Productos:</h4>
                                    {pedido.items && pedido.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderBottom: idx < pedido.items.length - 1 ? '1px solid #27272a' : 'none', padding: '0.4rem 0' }}>
                                            <span>{item.nombre} {item.talla ? `(Talla: ${item.talla})` : ''} x {item.cantidad}</span>
                                            <span style={{ fontWeight: 'bold' }}>${Number(item.precioUnitario * item.cantidad).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Total del Pedido */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                                    <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Total pagado:</span>
                                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        ${Number(pedido.total).toLocaleString()}
                                    </span>
                                </div>

                                <div style={{ marginTop: '1.25rem', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.5rem', padding: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.75rem', color: '#d4d4d8', fontSize: '0.85rem' }}>💬 Conversación del pedido</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                                        {(mensajes[pedido.id] || []).length === 0 ? (
                                            <span style={{ color: '#71717a', fontSize: '0.8rem' }}>Aún no hay mensajes.</span>
                                        ) : (mensajes[pedido.id] || []).map(mensaje => (
                                            <div key={mensaje.id} style={{ backgroundColor: mensaje.rolAutor === 'EMPLEADO' || mensaje.rolAutor === 'ADMIN' ? '#3f1d1d' : '#27272a', borderRadius: '0.4rem', padding: '0.55rem 0.7rem' }}>
                                                <div style={{ color: '#fca5a5', fontSize: '0.7rem', fontWeight: 'bold' }}>{mensaje.rolAutor || 'CLIENTE'} · {mensaje.fecha ? new Date(mensaje.fecha).toLocaleString() : ''}</div>
                                                <div style={{ color: '#f4f4f5', fontSize: '0.85rem' }}>{mensaje.mensaje}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {rolUsuario === 'ADMIN' || rolUsuario === 'EMPLEADO' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                                            <button onClick={() => actualizarEstado(pedido.id, 'APROBADO', '¡Pedido recibido y está chimba!')} style={{ backgroundColor: '#15803d', color: 'white', border: 0, borderRadius: '0.35rem', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>✓ Está chimba</button>
                                            <button onClick={() => actualizarEstado(pedido.id, 'EN_PREPARACION', 'Pedido confirmado, estamos preparándolo.')} style={{ backgroundColor: '#b45309', color: 'white', border: 0, borderRadius: '0.35rem', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>Preparar</button>
                                            <button onClick={() => actualizarEstado(pedido.id, 'ENVIADO', 'Tu pedido ya fue enviado.')} style={{ backgroundColor: '#2563eb', color: 'white', border: 0, borderRadius: '0.35rem', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>Enviar</button>
                                        </div>
                                    ) : null}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input value={nuevoMensaje[pedido.id] || ''} onChange={e => setNuevoMensaje(prev => ({ ...prev, [pedido.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && enviarMensaje(pedido.id)} placeholder="Escribe un mensaje sobre el pedido..." style={{ flex: 1, minWidth: 0, backgroundColor: '#09090b', color: 'white', border: '1px solid #3f3f46', borderRadius: '0.35rem', padding: '0.55rem' }} />
                                        <button onClick={() => enviarMensaje(pedido.id)} style={{ backgroundColor: '#dc2626', color: 'white', border: 0, borderRadius: '0.35rem', padding: '0 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Enviar</button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}