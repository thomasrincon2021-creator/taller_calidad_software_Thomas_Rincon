import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Canvas3D from '../../components/Canvas3D';

const mapearColorPrenda = (valor) => {
    if (!valor) return '#e3e3ec';

    const texto = String(valor).trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(texto)) {
        return texto;
    }

    const colorNormalizado = texto.toLowerCase();
    const colores = {
        negro: '#111111',
        negra: '#111111',
        blanco: '#ffffff',
        blanca: '#ffffff',
        rojo: '#dc2626',
        roja: '#dc2626',
        azul: '#2563eb',
        verde: '#16a34a',
        amarillo: '#facc15',
        dorado: '#fbbf24',
        gris: '#6b7280',
        plateado: '#c0c0c0',
        beige: '#d6b28b',
        crema: '#fef3c7',
        marron: '#7c2d12',
        cafe: '#7c2d12',
        brown: '#7c2d12',
        morado: '#7c3aed',
        lila: '#8b5cf6',
        naranja: '#f97316',
        rosado: '#ec4899',
        rosa: '#ec4899'
    };

    const colorEncontrado = Object.entries(colores).find(([clave]) => colorNormalizado.includes(clave));
    return colorEncontrado ? colorEncontrado[1] : '#e3e3ec';
};

const parsePersonalizacion = (item) => {
    if (!item?.personalizacion) return null;
    if (typeof item.personalizacion === 'object') return item.personalizacion;

    try {
        const parsed = JSON.parse(item.personalizacion);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        console.error('Error al parsear personalización del pedido:', error);
        return null;
    }
};

const inferirRutaModelo = (item, personalizacion) => {
    if (item?.modelo3d) return item.modelo3d;

    const descripcion = `${item?.categoria || ''} ${item?.nombre || ''} ${personalizacion?.descripcion || ''}`.toLowerCase();
    if (descripcion.includes('hoodie') || descripcion.includes('hoody') || descripcion.includes('buzo') || descripcion.includes('sudadera')) {
        return '/modelos/hoodies_base.glb';
    }
    if (descripcion.includes('pantalon') || descripcion.includes('pantalón') || descripcion.includes('baggy')) {
        return '/modelos/pantalon_base.glb';
    }
    return '/modelos/camiseta_base.glb';
};

const obtenerFrasesResumen = (frases = {}) => {
    return Object.entries(frases)
        .filter(([, valor]) => typeof valor === 'string' && valor.trim())
        .map(([clave, valor]) => `${clave}: ${valor.trim()}`)
        .join(' | ');
};

export default function Reportes() {
    const navigate = useNavigate();
    const location = useLocation();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensajes, setMensajes] = useState({});
    const [nuevoMensaje, setNuevoMensaje] = useState({});
    const [archivosMensaje, setArchivosMensaje] = useState({});
    const [archivosSeleccionados, setArchivosSeleccionados] = useState({});
    const [previewsArchivo, setPreviewsArchivo] = useState({});
    const archivosMensajeRef = useRef({});
    const archivosSeleccionadosRef = useRef({});

    const emailUsuario = localStorage.getItem('usuarioEmail') || '';
    const rolUsuario = localStorage.getItem('usuarioRol') || 'CLIENTE';
   const esStaff = rolUsuario === 'ADMIN' || rolUsuario === 'EMPLEADO';

const mostrarTodosLosPedidos =
    esStaff && new URLSearchParams(location.search).get('vista') === 'admin';

const puedeGestionarPedidos = mostrarTodosLosPedidos;

    useEffect(() => {
        const obtenerHistorial = async () => {
            try {
                const endpoint = mostrarTodosLosPedidos
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
    }, [emailUsuario, rolUsuario, esStaff, mostrarTodosLosPedidos]);

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

    const leerArchivoComoDataUrl = (file) => new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer el archivo adjunto.'));
        reader.readAsDataURL(file);
    });

    const manejarArchivoMensaje = async (pedidoId, file) => {
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        archivosSeleccionadosRef.current[pedidoId] = file;
        setArchivosSeleccionados(prev => ({ ...prev, [pedidoId]: file }));
        setPreviewsArchivo(prev => ({ ...prev, [pedidoId]: previewUrl }));

        try {
            const archivoBase64 = await leerArchivoComoDataUrl(file);
            archivosMensajeRef.current[pedidoId] = archivoBase64;
            setArchivosMensaje(prev => ({ ...prev, [pedidoId]: archivoBase64 }));
        } catch (error) {
            console.error('Error al cargar archivo para mensaje:', error);
        }
    };

    const enviarMensaje = async (pedidoId) => {
        const texto = (nuevoMensaje[pedidoId] || '').trim();
        const archivoSeleccionado = archivosSeleccionadosRef.current[pedidoId] || null;
        let imagen = archivosMensajeRef.current[pedidoId] || archivosMensaje[pedidoId] || null;

        if (archivoSeleccionado && !imagen) {
            imagen = await leerArchivoComoDataUrl(archivoSeleccionado);
            archivosMensajeRef.current[pedidoId] = imagen;
        }

        if (!texto && !imagen) return;

        try {
            const payload = {
                autorEmail: emailUsuario,
                rolAutor: rolUsuario
            };

            if (texto) payload.mensaje = texto;
            if (imagen) payload.imagen = imagen;

            const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const detalle = await response.text();
                throw new Error(detalle || 'No se pudo enviar el mensaje.');
            }

            setNuevoMensaje(prev => ({ ...prev, [pedidoId]: '' }));
            setArchivosMensaje(prev => ({ ...prev, [pedidoId]: null }));
            setArchivosSeleccionados(prev => ({ ...prev, [pedidoId]: null }));
            setPreviewsArchivo(prev => ({ ...prev, [pedidoId]: null }));
            archivosMensajeRef.current[pedidoId] = null;
            archivosSeleccionadosRef.current[pedidoId] = null;
            cargarMensajes(pedidoId);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert(error.message || 'No se pudo enviar el mensaje.');
        }
    };

    const enviarMensajeTexto = async (pedidoId, texto) => {
        if (!texto || !texto.trim()) return;

        const response = await fetch(`http://localhost:8080/api/pedidos/${pedidoId}/mensajes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: texto.trim(), autorEmail: emailUsuario, rolAutor: rolUsuario })
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
            <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0 }}>
                    📊 {mostrarTodosLosPedidos ? 'Reporte General de Ventas' : 'Mis Compras y Pedidos'}
                </h2>
                <button
                    onClick={() => navigate('/catalogo')}
                    style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.6rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Volver al Catálogo
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {cargando ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center' }}>Cargando historial de pedidos...</p>
                ) : pedidos.length === 0 ? (
                    <div style={{ backgroundColor: '#09090b', border: '1px solid #27272a', padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
                        <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>No se encontraron compras o pedidos registrados.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {pedidos.map((pedido) => {
                            const resumenPedido = pedido.items || [];

                            return (
                                <div key={pedido.id} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.8rem', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #18181b', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '1.1rem' }}>Pedido #{pedido.id}</span>
                                            <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                                {pedido.fecha ? new Date(pedido.fecha).toLocaleString() : 'Reciente'}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                backgroundColor: pedido.estado === 'APROBADO' ? '#15803d' : '#b45309',
                                                color: 'white',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {pedido.estado || 'PENDIENTE'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#d4d4d8' }}>
                                        <p style={{ margin: 0 }}><strong>Usuario:</strong> {pedido.usuarioEmail}</p>
                                        <p style={{ margin: 0 }}><strong>Ciudad / Dirección:</strong> {pedido.ciudadEnvio} - {pedido.direccionEnvio}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '1rem', alignItems: 'start' }}>
                                        <div style={{ backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '1rem' }}>
                                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Solicitado</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {resumenPedido.map((item, idx) => {
                                                    const personalizacion = parsePersonalizacion(item);
                                                    const rutaModelo = inferirRutaModelo(item, personalizacion);
                                                    const colorPrenda = mapearColorPrenda(
                                                        item.colorHex || item.color || personalizacion?.colorHex || personalizacion?.color || '#e3e3ec'
                                                    );

                                                    return (
                                                        <div key={`${item.id || idx}`} style={{ border: '1px solid #27272a', borderRadius: '0.6rem', padding: '0.85rem', backgroundColor: '#09090b' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                                                                <span style={{ fontWeight: 'bold', color: '#f4f4f5' }}>{item.nombre}</span>
                                                                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                                                                    ${Number(item.precioUnitario * item.cantidad).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.6 }}>
                                                                <div>Talla: {item.talla || 'Única'}</div>
                                                                <div>Cantidad: {item.cantidad}</div>
                                                                {personalizacion ? (
                                                                    <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                                                            <span style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '999px', padding: '0.2rem 0.55rem', color: '#e5e7eb' }}>
                                                                                👕 {personalizacion.ubicacion || 'No especificada'}
                                                                            </span>
                                                                            <span style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '999px', padding: '0.2rem 0.55rem', color: '#e5e7eb' }}>
                                                                                📝 {personalizacion.frases ? Object.values(personalizacion.frases).filter(Boolean).length : 0} frases
                                                                            </span>
                                                                            <span style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '999px', padding: '0.2rem 0.55rem', color: '#e5e7eb' }}>
                                                                                🖼️ {personalizacion.imagenes?.length || 0} imágenes
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ color: '#d4d4d8' }}>
                                                                            <strong>Frases:</strong> {obtenerFrasesResumen(personalizacion.frases || {}) || 'Sin texto'}
                                                                        </div>
                                                                        <div style={{ color: '#d4d4d8' }}>
                                                                            <strong>Colores:</strong> {personalizacion.colorTinta || 'Sin tinta'} • {personalizacion.estiloTextoFrente?.color || personalizacion.estiloTexto?.color || 'Sin detalle'}
                                                                        </div>
                                                                        {(personalizacion.notas || '').trim() && (
                                                                            <div style={{ color: '#d4d4d8' }}>
                                                                                <strong>Notas:</strong> {personalizacion.notas}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ marginTop: '0.5rem', color: '#fca5a5' }}>Sin personalización añadida.</div>
                                                                )}
                                                            </div>

                                                            {personalizacion && (
                                                                <div style={{ marginTop: '0.75rem', border: '1px solid #27272a', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                                                    {(personalizacion.imagenes || []).length > 0 && (
                                                                        <div style={{ padding: '0.75rem 0.75rem 0', backgroundColor: '#0b0b0b' }}>
                                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                                                                {(personalizacion.imagenes || []).map((img, index) => (
                                                                                    <div key={`personalizacion-img-${index}`} style={{ backgroundColor: '#111111', border: '1px solid #3f3f46', borderRadius: '0.5rem', padding: '0.4rem' }}>
                                                                                        <img
                                                                                            src={img.url || img.preview || ''}
                                                                                            alt={`Imagen personalizada ${index + 1}`}
                                                                                            style={{ width: '100%', height: '110px', objectFit: 'contain', borderRadius: '0.35rem', backgroundColor: '#000' }}
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div style={{ height: '320px', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #27272a' }}>
                                                                        <Canvas3D
                                                                            rutaModelo={rutaModelo}
                                                                            ubicacion={personalizacion.ubicacion || 'frente'}
                                                                            imagenes={(personalizacion.imagenes || []).map((img, index) => ({
                                                                                url: img.url || img.preview || '',
                                                                                x: img.x || 0,
                                                                                y: img.y || 0,
                                                                                escala: img.escala || 1,
                                                                                rotacion: img.rotacion || 0,
                                                                                geometria: img.geometria || 'cuadrado'
                                                                            }))}
                                                                            frases={personalizacion.frases || {}}
                                                                            estiloTexto={personalizacion.estiloTexto || { color: '#ffffff', fuente: 'Arial', tamano: 48 }}
                                                                            estiloTextoFrente={personalizacion.estiloTextoFrente || personalizacion.estiloTexto || { color: '#ffffff', fuente: 'Arial', tamano: 48 }}
                                                                            estiloTextoAtras={personalizacion.estiloTextoAtras || personalizacion.estiloTexto || { color: '#ffffff', fuente: 'Arial', tamano: 48 }}
                                                                            posicionesFrases={personalizacion.posicionesFrases || {}}
                                                                            colorPrenda={colorPrenda}
                                                                            height={320}
                                                                            onMoveImage={() => {}}
                                                                            onMoveText={() => {}}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div style={{ backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '1rem' }}>
                                            <h4 style={{ margin: '0 0 0.75rem', color: '#d4d4d8', fontSize: '0.85rem' }}>💬 Chat del pedido</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', minHeight: '240px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                                                {(mensajes[pedido.id] || []).length === 0 ? (
                                                    <span style={{ color: '#71717a', fontSize: '0.8rem' }}>Aún no hay mensajes.</span>
                                                ) : (mensajes[pedido.id] || []).map((mensaje) => {
                                                    const textoMensaje = typeof mensaje.mensaje === 'string' ? mensaje.mensaje.trim() : '';
                                                    const mostrarTexto = textoMensaje && textoMensaje !== 'Imagen adjunta';

                                                    return (
                                                        <div key={mensaje.id} style={{ backgroundColor: mensaje.rolAutor === 'EMPLEADO' || mensaje.rolAutor === 'ADMIN' ? '#3f1d1d' : '#27272a', borderRadius: '0.4rem', padding: '0.55rem 0.7rem' }}>
                                                            <div style={{ color: '#fca5a5', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                                {mensaje.rolAutor || 'CLIENTE'} · {mensaje.fecha ? new Date(mensaje.fecha).toLocaleString() : ''}
                                                            </div>
                                                            {mostrarTexto ? (
                                                                <div style={{ color: '#f4f4f5', fontSize: '0.85rem', marginTop: '0.2rem' }}>{textoMensaje}</div>
                                                            ) : null}
                                                            {mensaje.imagen ? (
                                                                <img
                                                                    src={mensaje.imagen}
                                                                    alt="Mensaje adjunto"
                                                                    style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', marginTop: mostrarTexto ? '0.5rem' : '0', borderRadius: '0.35rem', backgroundColor: '#000' }}
                                                                />
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {puedeGestionarPedidos && (
    <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        flexWrap: 'wrap', 
        marginBottom: '0.75rem',
        padding: '0.75rem',
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '0.5rem'
    }}>
        <span style={{
            width: '100%',
            fontSize: '0.7rem',
            color: '#a1a1aa',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '0.2rem'
        }}>
            ⚙️ Gestión del pedido
        </span>

        <button 
            onClick={() => actualizarEstado(
                pedido.id, 
                'APROBADO', 
                '¡Pedido recibido y aprobado correctamente!'
            )}
            style={{ 
                backgroundColor: '#15803d', 
                color: 'white', 
                border: 0, 
                borderRadius: '0.35rem', 
                padding: '0.4rem 0.6rem', 
                cursor: 'pointer', 
                fontSize: '0.75rem',
                fontWeight: 'bold'
            }}
        >
            ✓ Aprobar
        </button>

        <button 
            onClick={() => actualizarEstado(
                pedido.id, 
                'EN_PREPARACION', 
                'Tu pedido fue confirmado y ya lo estamos preparando.'
            )}
            style={{ 
                backgroundColor: '#b45309', 
                color: 'white', 
                border: 0, 
                borderRadius: '0.35rem', 
                padding: '0.4rem 0.6rem', 
                cursor: 'pointer', 
                fontSize: '0.75rem',
                fontWeight: 'bold'
            }}
        >
            📦 Preparar
        </button>

        <button 
            onClick={() => actualizarEstado(
                pedido.id, 
                'ENVIADO', 
                '🚚 Tu pedido ya fue enviado.'
            )}
            style={{ 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 0, 
                borderRadius: '0.35rem', 
                padding: '0.4rem 0.6rem', 
                cursor: 'pointer', 
                fontSize: '0.75rem',
                fontWeight: 'bold'
            }}
        >
            🚚 Enviar
        </button>
    </div>
)}

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        value={nuevoMensaje[pedido.id] || ''}
                                                        onChange={e => setNuevoMensaje(prev => ({ ...prev, [pedido.id]: e.target.value }))}
                                                        onKeyDown={e => e.key === 'Enter' && enviarMensaje(pedido.id)}
                                                        placeholder="Escribe un mensaje sobre el pedido..."
                                                        style={{ flex: 1, minWidth: 0, backgroundColor: '#09090b', color: 'white', border: '1px solid #3f3f46', borderRadius: '0.35rem', padding: '0.55rem' }}
                                                    />
                                                    <button onClick={() => enviarMensaje(pedido.id)} style={{ backgroundColor: '#dc2626', color: 'white', border: 0, borderRadius: '0.35rem', padding: '0 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Enviar</button>
                                                </div>

                                                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#a1a1aa', fontSize: '0.75rem' }}>
                                                    Adjuntar imagen al chat
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => manejarArchivoMensaje(pedido.id, e.target.files?.[0])}
                                                        style={{ color: '#f4f4f5', padding: '0.35rem', backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '0.35rem' }}
                                                    />
                                                </label>

                                                {previewsArchivo[pedido.id] ? (
                                                    <div style={{ border: '1px solid #27272a', borderRadius: '0.4rem', padding: '0.5rem', backgroundColor: '#09090b' }}>
                                                        <img src={previewsArchivo[pedido.id]} alt="Vista previa del archivo adjunto" style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '0.35rem' }} />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
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