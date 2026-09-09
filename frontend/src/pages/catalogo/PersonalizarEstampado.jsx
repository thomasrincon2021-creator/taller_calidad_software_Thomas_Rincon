import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const PersonalizarEstampado = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const producto = location.state?.producto;

    // Redirigir al catálogo si entra sin producto
    useEffect(() => {
        if (!producto) {
            navigate('/catalogo');
        }
    }, [producto, navigate]);

    const colorPrendaHex = useMemo(() => {
        return mapearColorPrenda(producto?.colorHex || producto?.color || producto?.nombre || '');
    }, [producto]);

    const rutaModelo = useMemo(() => {
        if (producto?.modelo3d) return producto.modelo3d;

        const descripcion = `${producto?.categoria || ''} ${producto?.nombre || ''} ${producto?.descripcion || ''}`.toLowerCase();
        if (descripcion.includes('hoodie') || descripcion.includes('hoody') || descripcion.includes('buzo') || descripcion.includes('sudadera')) {
            return '/modelos/hoodies_base.glb';
        }
        if (descripcion.includes('pantalon') || descripcion.includes('pantalón') || descripcion.includes('baggy')) {
            return '/modelos/pantalon_base.glb';
        }
        return '/modelos/camiseta_base.glb';
    }, [producto]);

    // Estados del formulario
    const [ubicacion, setUbicacion] = useState(() => rutaModelo.includes('pantalon') ? 'pantalon-frente' : 'frente');
    const [imagenes, setImagenes] = useState([]);
    const [colorTinta, setColorTinta] = useState('#ffffff');
    const [colorTintaAdelante, setColorTintaAdelante] = useState('');
    const [colorTintaAtras, setColorTintaAtras] = useState('');
    const [fuenteTexto, setFuenteTexto] = useState('Arial');
    const [fuenteTextoAdelante, setFuenteTextoAdelante] = useState('Arial');
    const [fuenteTextoAtras, setFuenteTextoAtras] = useState('Arial');
    const [tamanoTexto, setTamanoTexto] = useState(48);
    const [posicionesFrases, setPosicionesFrases] = useState({});
    const [notas, setNotas] = useState('');

    // Estados de frases según ubicación
    const [textoSimple, setTextoSimple] = useState('');
    const [textoAtras, setTextoAtras] = useState('');
    const [textoLadoA, setTextoLadoA] = useState('');
    const [textoLadoB, setTextoLadoB] = useState('');
    const [textoAdelante, setTextoAdelante] = useState('');
    const [textoMangaIzq, setTextoMangaIzq] = useState('');
    const [textoMangaDer, setTextoMangaDer] = useState('');

    const [precioExtra, setPrecioExtra] = useState(0);

    const esPantalon = rutaModelo.includes('pantalon');

    const ubicaciones = esPantalon ? [
        { id: 'pantalon-frente', nombre: 'Frente del pantalón (1 o 2 diseños)', costo: 10000, tipo: 'simple' },
        { id: 'pantalon-espalda', nombre: 'Parte trasera del pantalón', costo: 10000, tipo: 'simple' },
        { id: 'pantalon-ambos', nombre: 'Adelante y atrás', costo: 18000, tipo: 'simple' }
    ] : [
        { id: 'frente', nombre: 'Parte del frente (1 o 2 diseños)', costo: 10000, tipo: 'simple' },
        { id: 'espalda', nombre: 'Parte trasera', costo: 10000, tipo: 'simple' },
        { id: 'ambos', nombre: 'Adelante y atrás', costo: 18000, tipo: 'simple' }
    ];

    // Recalcular precio dinámico
    useEffect(() => {
        const ubicacionObj = ubicaciones.find(u => u.id === ubicacion);
        let baseCost = ubicacionObj ? ubicacionObj.costo : 0;
        
        // Costo adicional por imágenes cargadas ($3,000 por imagen)
        const costoImagenes = imagenes.length * 3000;

        setPrecioExtra(baseCost + costoImagenes);
    }, [ubicacion, imagenes]);

    // Manejar selección de imágenes
    const manejarSeleccionImagenes = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imagenes.length > 2) {
            alert('Puedes subir como máximo 2 imágenes por zona.');
            return;
        }

        const nuevasImagenes = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            x: 0,
            y: 0,
            escala: 1,
            rotacion: 0,
            geometria: 'cuadrado'
        }));

        setImagenes(prev => [...prev, ...nuevasImagenes].slice(0, 3));
    };

    const eliminarImagen = (index) => {
        URL.revokeObjectURL(imagenes[index].preview);
        setImagenes(prev => prev.filter((_, i) => i !== index));
    };

    const actualizarImagen = (index, propiedad, valor) => {
        setImagenes(prev => prev.map((imagen, indice) => {
            if (indice !== index) return imagen;
            const valorFinal = propiedad === 'geometria' ? valor : Number(valor);
            return { ...imagen, [propiedad]: valorFinal };
        }));
    };

    const moverImagenDesdeVisor = (index, coordenadas) => {
        setImagenes(prev => prev.map((imagen, indice) => indice === index
            ? { ...imagen, ...coordenadas }
            : imagen));
    };

    const moverFraseDesdeVisor = (fraseId, coordenadas) => {
        setPosicionesFrases(prev => ({
            ...prev,
            [fraseId]: {
                ...(prev[fraseId] || {}),
                ...coordenadas
            }
        }));
    };

    const obtenerFraseTransform = (fraseId) => posicionesFrases?.[fraseId] || {};

    const actualizarFraseTransform = (fraseId, propiedad, valor) => {
        setPosicionesFrases(prev => ({
            ...prev,
            [fraseId]: {
                ...(prev[fraseId] || {}),
                [propiedad]: Number(valor)
            }
        }));
    };

    const moverFraseConFlechas = (fraseId, deltaX, deltaY) => {
        setPosicionesFrases(prev => {
            const actual = prev[fraseId] || { x: 0, y: 0 };
            const invertidoEnEspalda = ['atras', 'ladoB'].includes(fraseId);
            const siguienteX = Math.max(-4, Math.min(4, Number(actual.x || 0) + (invertidoEnEspalda ? -deltaX : deltaX)));
            const siguienteY = Math.max(-5, Math.min(5, Number(actual.y || 0) + deltaY));

            return {
                ...prev,
                [fraseId]: {
                    ...actual,
                    x: siguienteX,
                    y: siguienteY
                }
            };
        });
    };

    const ControlesFlechas = ({ fraseId }) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.35rem', marginTop: '0.5rem' }}>
            <div />
            <button type="button" onClick={() => moverFraseConFlechas(fraseId, 0, 0.15)} style={{ padding: '0.35rem', borderRadius: '0.35rem', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: 'white', cursor: 'pointer' }}>↑</button>
            <div />
            <button type="button" onClick={() => moverFraseConFlechas(fraseId, -0.15, 0)} style={{ padding: '0.35rem', borderRadius: '0.35rem', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: 'white', cursor: 'pointer' }}>←</button>
            <button type="button" onClick={() => moverFraseConFlechas(fraseId, 0, -0.15)} style={{ padding: '0.35rem', borderRadius: '0.35rem', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: 'white', cursor: 'pointer' }}>↓</button>
            <button type="button" onClick={() => moverFraseConFlechas(fraseId, 0.15, 0)} style={{ padding: '0.35rem', borderRadius: '0.35rem', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: 'white', cursor: 'pointer' }}>→</button>
        </div>
    );

    const convertirImagenADatos = (imagen) => new Promise((resolve) => {
        if (!imagen?.file) {
            resolve(imagen?.preview || imagen?.url || '');
            return;
        }

        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => resolve(imagen.preview);
        lector.readAsDataURL(imagen.file);
    });

    // Guarda la prenda personalizada antes de volver al carrito.
    const guardarEstampadoEnItem = async () => {
        const tipoUbicacion = ubicaciones.find(u => u.id === ubicacion)?.tipo;

        let frases = {};
        if (tipoUbicacion === 'simple') {
            if (ubicacion === 'ambos') {
                frases = { adelante: textoSimple, atras: textoAtras };
            } else if (ubicacion === 'espalda') {
                frases = { atras: textoAtras || textoSimple };
            } else {
                frases = { adelante: textoSimple };
            }
        } else if (tipoUbicacion === 'doble') {
            frases = { ladoA: textoLadoA, ladoB: textoLadoB };
        } else if (tipoUbicacion === 'cuadruple') {
            frases = { adelante: textoAdelante, atras: textoAtras, mangaIzq: textoMangaIzq, mangaDer: textoMangaDer };
        }

        const precioBase = producto?.precio || 0;
        const precioTotal = precioBase + precioExtra;
        const imagenesPersistentes = await Promise.all(imagenes.map(async (img) => ({
            url: await convertirImagenADatos(img),
            x: img.x,
            y: img.y,
            escala: img.escala,
            rotacion: img.rotacion,
            geometria: img.geometria || 'cuadrado'
        })));

        const datosEstampado = {
            ubicacion,
            colorTinta,
            estiloTexto: { color: colorTinta, fuente: fuenteTexto, tamano: tamanoTexto },
            estiloTextoFrente: { color: colorTintaAdelante || colorTinta, fuente: fuenteTextoAdelante || fuenteTexto, tamano: tamanoTexto },
            estiloTextoAtras: { color: colorTintaAtras || colorTinta, fuente: fuenteTextoAtras || fuenteTexto, tamano: tamanoTexto },
            posicionesFrases,
            notas,
            costoExtra: precioExtra,
            precioTotalFinal: precioTotal,
            frases,
            imagenes: imagenesPersistentes
        };

        const productoModificado = {
            ...producto,
            precioTotalFinal: precioTotal,
            estampado: datosEstampado
        };

        try {
            const carritoGuardado = JSON.parse(localStorage.getItem('carrito_nowstyle') || '[]');
            const carritoActualizado = carritoGuardado.map(item =>
                item.cartItemId === productoModificado.cartItemId ? productoModificado : item
            );
            localStorage.setItem('carrito_nowstyle', JSON.stringify(carritoActualizado));
        } catch (error) {
            console.error('No se pudo guardar la personalización:', error);
        }

        navigate('/catalogo', { 
            state: { 
                productoActualizado: productoModificado
            } 
        });
    };

    const tipoActual = ubicaciones.find(u => u.id === ubicacion)?.tipo || 'simple';
    const precioBasePrenda = producto?.precio || 0;
    const precioTotalPrenda = precioBasePrenda + precioExtra;

    return (
        <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'start', gap: '2rem', width: '100%', maxWidth: '1100px', backgroundColor: '#121215', padding: '2rem', borderRadius: '1rem', border: '1px solid #27272a' }}>
                
                {/* COLUMNA IZQUIERDA: Visor 3D */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ color: 'white', margin: 0, fontWeight: '900', textTransform: 'uppercase' }}>👁️ Previsualización 3D</h3>
                    <Canvas3D 
                        rutaModelo={rutaModelo}
                        ubicacion={ubicacion}
                        imagenes={imagenes.map(img => ({
                            url: img.preview,
                            x: img.x,
                            y: img.y,
                            escala: img.escala,
                            rotacion: img.rotacion,
                            geometria: img.geometria || 'cuadrado'
                        }))}
                        frases={
                            tipoActual === 'simple'
                                ? { adelante: textoSimple, atras: textoAtras }
                                : tipoActual === 'doble'
                                    ? { ladoA: textoLadoA, ladoB: textoLadoB }
                                    : { adelante: textoAdelante, atras: textoAtras, mangaIzq: textoMangaIzq, mangaDer: textoMangaDer }
                        }
                        estiloTexto={{ color: colorTinta, fuente: fuenteTexto, tamano: tamanoTexto }}
                        estiloTextoFrente={{ color: colorTintaAdelante || colorTinta, fuente: fuenteTextoAdelante || fuenteTexto, tamano: tamanoTexto }}
                        estiloTextoAtras={{ color: colorTintaAtras || colorTinta, fuente: fuenteTextoAtras || fuenteTexto, tamano: tamanoTexto }}
                        posicionesFrases={posicionesFrases}
                        colorPrenda={colorPrendaHex}
                        onMoveImage={moverImagenDesdeVisor}
                        onMoveText={moverFraseDesdeVisor}
                    />
                </div>

                {/* COLUMNA DERECHA: Formulario */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '2rem', boxSizing: 'border-box', position: 'relative', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto', minHeight: 0 }}>
                    
                    <button onClick={() => navigate('/catalogo')} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    
                    <h3 style={{ color: 'white', margin: '0 0 0.25rem 0', fontWeight: '900', textTransform: 'uppercase' }}>🎨 Añadir Estampado</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Personalizando: <strong style={{ color: 'white' }}>{producto?.nombre}</strong> (Talla: {producto?.talla})
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* 1. Ubicación */}
                        <div>
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>1. Ubicación en la prenda:</label>
                            <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }}>
                                {ubicaciones.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre} (+${u.costo.toLocaleString('es-CO')})</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Subir Imágenes */}
                        <div>
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>2. Sube tus diseños (Máx 2 imágenes):</label>
                            <input type="file" accept="image/png, image/jpeg, image/webp" multiple onChange={manejarSeleccionImagenes} style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.5rem', borderRadius: '0.4rem', fontSize: '0.8rem' }} />
                            
                            {/* Previsualización de imágenes */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'start' }}>
                                {imagenes.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', minWidth: 0, padding: '0.5rem', border: '1px solid #27272a', borderRadius: '0.4rem', backgroundColor: '#09090b', boxSizing: 'border-box' }}>
                                        <img src={img.preview} alt="preview" style={{ display: 'block', width: '100%', height: '110px', objectFit: 'contain', backgroundColor: '#000', borderRadius: '0.3rem', border: '1px solid #3f3f46' }} />
                                        <button onClick={() => eliminarImagen(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem 0.65rem', marginTop: '0.65rem' }}>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.7rem' }}>Horizontal
                                                <input type="range" min="-4" max="4" step="0.05" value={img.x} onChange={e => actualizarImagen(idx, 'x', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.7rem' }}>Vertical
                                                <input type="range" min="-5" max="5" step="0.05" value={img.y} onChange={e => actualizarImagen(idx, 'y', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.7rem' }}>Tamaño
                                                <input type="range" min="0.4" max="2" step="0.05" value={img.escala} onChange={e => actualizarImagen(idx, 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.7rem' }}>Giro
                                                <input type="range" min="-180" max="180" step="1" value={img.rotacion} onChange={e => actualizarImagen(idx, 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                                            <label style={{ color: '#a1a1aa', fontSize: '0.7rem' }}>Forma
                                                <select value={img.geometria || 'cuadrado'} onChange={e => actualizarImagen(idx, 'geometria', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.2rem 0.35rem', borderRadius: '0.25rem' }}>
                                                    <option value="cuadrado">Cuadrado</option>
                                                    <option value="rectangular">Rectangular</option>
                                                    <option value="circulo">Círculo</option>
                                                    <option value="rombo">Rombo</option>
                                                </select>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Frases de Estampado */}
                        <div>
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>3. Frase del estampado (opcional):</label>
                            
                            {tipoActual === 'simple' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {ubicacion !== 'espalda' && (
                                        <div>
                                            <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase adelante:</span>
                                            <input type="text" value={textoSimple} onChange={(e) => setTextoSimple(e.target.value)} placeholder="Ej: Estilo Urbano 2026" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                                <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                    <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('adelante').escala ?? 1} onChange={(e) => actualizarFraseTransform('adelante', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                                </label>
                                                <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                    <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('adelante').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('adelante', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                                </label>
                                            </div>
                                            <ControlesFlechas fraseId="adelante" />
                                        </div>
                                    )}

                                    {ubicacion !== 'frente' && (
                                        <div>
                                            <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase atrás:</span>
                                            <input type="text" value={textoAtras} onChange={(e) => setTextoAtras(e.target.value)} placeholder="Frase para la espalda" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                                <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                    <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('atras').escala ?? 1} onChange={(e) => actualizarFraseTransform('atras', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                                </label>
                                                <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                    <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('atras').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('atras', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                                </label>
                                            </div>
                                            <ControlesFlechas fraseId="atras" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {tipoActual === 'doble' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Zona 1 / Izquierda / Adelante:</span>
                                        <input type="text" value={textoLadoA} onChange={(e) => setTextoLadoA(e.target.value)} placeholder="Frase para esta zona" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('ladoA').escala ?? 1} onChange={(e) => actualizarFraseTransform('ladoA', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('ladoA').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('ladoA', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                        </div>
                                        <ControlesFlechas fraseId="ladoA" />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Zona 2 / Derecha / Atrás:</span>
                                        <input type="text" value={textoLadoB} onChange={(e) => setTextoLadoB(e.target.value)} placeholder="Frase para la otra zona" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('ladoB').escala ?? 1} onChange={(e) => actualizarFraseTransform('ladoB', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('ladoB').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('ladoB', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                        </div>
                                        <ControlesFlechas fraseId="ladoB" />
                                    </div>
                                </div>
                            )}

                            {tipoActual === 'cuadruple' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Adelante (Pecho):</span>
                                        <input type="text" value={textoAdelante} onChange={(e) => setTextoAdelante(e.target.value)} placeholder="Texto para el frente" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('adelante').escala ?? 1} onChange={(e) => actualizarFraseTransform('adelante', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('adelante').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('adelante', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                        </div>
                                        <ControlesFlechas fraseId="adelante" />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Atrás (Espalda):</span>
                                        <input type="text" value={textoAtras} onChange={(e) => setTextoAtras(e.target.value)} placeholder="Texto para la espalda" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('atras').escala ?? 1} onChange={(e) => actualizarFraseTransform('atras', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('atras').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('atras', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                        </div>
                                        <ControlesFlechas fraseId="atras" />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Manga Izquierda:</span>
                                        <input type="text" value={textoMangaIzq} onChange={(e) => setTextoMangaIzq(e.target.value)} placeholder="Texto manga izquierda" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('mangaIzq').escala ?? 1} onChange={(e) => actualizarFraseTransform('mangaIzq', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('mangaIzq').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('mangaIzq', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                        </div>
                                        <ControlesFlechas fraseId="mangaIzq" />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Manga Derecha:</span>
                                        <input type="text" value={textoMangaDer} onChange={(e) => setTextoMangaDer(e.target.value)} placeholder="Texto manga derecha" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Tamaño
                                                <input type="range" min="0.5" max="2" step="0.05" value={obtenerFraseTransform('mangaDer').escala ?? 1} onChange={(e) => actualizarFraseTransform('mangaDer', 'escala', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                            <label style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Giro
                                                <input type="range" min="-180" max="180" step="1" value={obtenerFraseTransform('mangaDer').rotacion ?? 0} onChange={(e) => actualizarFraseTransform('mangaDer', 'rotacion', e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} />
                                            </label>
                                        </div>
                                        <ControlesFlechas fraseId="mangaDer" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Tinta */}
                        <div>
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>4. Color de la tinta:</label>
                            <input type="color" value={colorTinta} onChange={(e) => setColorTinta(e.target.value)} style={{ width: '100%', height: '42px', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.4rem', cursor: 'pointer' }} />
                            {(ubicacion === 'ambos' || ubicacion === 'pantalon-ambos') ? (
                                <>
                                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginTop: '0.75rem' }}>Color de la frase adelante</label>
                                    <input type="color" value={colorTintaAdelante} onChange={(e) => setColorTintaAdelante(e.target.value)} style={{ width: '100%', height: '42px', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.4rem', cursor: 'pointer' }} />
                                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginTop: '0.75rem' }}>Tipo de letra adelante</label>
                                    <select value={fuenteTextoAdelante} onChange={(e) => setFuenteTextoAdelante(e.target.value)} style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }}>
                                        <option value="Arial">Arial</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Trebuchet MS">Trebuchet MS</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Poppins">Poppins</option>
                                        <option value="Oswald">Oswald</option>
                                        <option value="Bebas Neue">Bebas Neue</option>
                                        <option value="Urbanist">Urbanist</option>
                                        <option value="Orbitron">Orbitron</option>
                                        <option value="Righteous">Righteous</option>
                                        <option value="Segoe Print">Cursiva</option>
                                    </select>
                                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginTop: '0.75rem' }}>Color de la frase atrás</label>
                                    <input type="color" value={colorTintaAtras} onChange={(e) => setColorTintaAtras(e.target.value)} style={{ width: '100%', height: '42px', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.4rem', cursor: 'pointer' }} />
                                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginTop: '0.75rem' }}>Tipo de letra atrás</label>
                                    <select value={fuenteTextoAtras} onChange={(e) => setFuenteTextoAtras(e.target.value)} style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }}>
                                        <option value="Arial">Arial</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Trebuchet MS">Trebuchet MS</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Poppins">Poppins</option>
                                        <option value="Oswald">Oswald</option>
                                        <option value="Bebas Neue">Bebas Neue</option>
                                        <option value="Urbanist">Urbanist</option>
                                        <option value="Orbitron">Orbitron</option>
                                        <option value="Righteous">Righteous</option>
                                        <option value="Segoe Print">Cursiva</option>
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginTop: '0.75rem' }}>Tipo de letra</label>
                                    <select value={fuenteTexto} onChange={(e) => setFuenteTexto(e.target.value)} style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }}>
                                        <option value="Arial">Arial</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Trebuchet MS">Trebuchet MS</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Poppins">Poppins</option>
                                        <option value="Oswald">Oswald</option>
                                        <option value="Bebas Neue">Bebas Neue</option>
                                        <option value="Urbanist">Urbanist</option>
                                        <option value="Orbitron">Orbitron</option>
                                        <option value="Righteous">Righteous</option>
                                        <option value="Segoe Print">Cursiva</option>
                                    </select>
                                </>
                            )}
                        </div>

                        {/* 5. Notas */}
                        <div>
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>5. Información o instrucciones adicionales:</label>
                            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows="3" placeholder="Ej: Quiero que el logo esté ligeramente inclinado..." style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem', resize: 'none', fontFamily: 'sans-serif' }} />
                        </div>

                        {/* Precio Dinámico */}
                        <div style={{ backgroundColor: '#000000', border: '1px solid #27272a', padding: '1rem', borderRadius: '0.5rem', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#a1a1aa' }}>
                                <span>Precio Base Prenda:</span>
                                <span>${precioBasePrenda.toLocaleString('es-CO')} COP</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.6rem', color: '#a1a1aa' }}>
                                <span>Adicional Estampado:</span>
                                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>+${precioExtra.toLocaleString('es-CO')} COP</span>
                            </div>
                            <div style={{ borderTop: '1px solid #27272a', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.05rem' }}>
                                <span>TOTAL PRENDA:</span>
                                <span style={{ color: '#22c55e' }}>${precioTotalPrenda.toLocaleString('es-CO')} COP</span>
                            </div>
                        </div>

                        <button onClick={guardarEstampadoEnItem} style={{ backgroundColor: '#ffffff', color: 'black', border: 'none', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', width: '100%' }}>
                            🎯 Vincular Estampado a la Prenda
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalizarEstampado;