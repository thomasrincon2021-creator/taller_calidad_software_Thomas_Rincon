import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Reportes() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

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
                }
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerHistorial();
    }, [emailUsuario, rolUsuario]);

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

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}