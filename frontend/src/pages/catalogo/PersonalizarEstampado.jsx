import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Canvas3D from '../../components/Canvas3D';

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

    // Detección automática del color hexadecimal si producto.colorHex no existe
    // Detección automática del color hexadecimal si producto.colorHex no existe
const colorPrendaHex = useMemo(() => {
    if (producto?.colorHex) return producto.colorHex;
    
    const nombre = (producto?.nombre || '').toLowerCase();
    
    // Cambiamos #121212 por un tono carbón/antracita (#27272a)
    if (nombre.includes('negra') || nombre.includes('negro')) return '#27272a';
    if (nombre.includes('blanca') || nombre.includes('blanco')) return '#ffffff';
    if (nombre.includes('roja') || nombre.includes('rojo')) return '#dc2626';
    if (nombre.includes('azul')) return '#2563eb';
    
    return '#e3e3ec'; // Color oscuro por defecto
}, [producto]);

    // Estados del formulario
    const [ubicacion, setUbicacion] = useState('pecho');
    const [imagenes, setImagenes] = useState([]);
    const [colorTinta, setColorTinta] = useState('Blanco');
    const [notas, setNotas] = useState('');

    // Estados de frases según ubicación
    const [textoSimple, setTextoSimple] = useState('');
    const [textoLadoA, setTextoLadoA] = useState('');
    const [textoLadoB, setTextoLadoB] = useState('');
    const [textoAdelante, setTextoAdelante] = useState('');
    const [textoAtras, setTextoAtras] = useState('');
    const [textoMangaIzq, setTextoMangaIzq] = useState('');
    const [textoMangaDer, setTextoMangaDer] = useState('');

    const [precioExtra, setPrecioExtra] = useState(0);

    // Opciones de ubicaciones
    const ubicaciones = [
        { id: 'pecho', nombre: 'Pecho / Frente', costo: 10000, tipo: 'simple' },
        { id: 'espalda', nombre: 'Espalda Central', costo: 15000, tipo: 'simple' },
        { id: 'doble', nombre: 'Pecho + Espalda', costo: 22000, tipo: 'doble' },
        { id: 'mangas', nombre: 'Manga Izquierda + Manga Derecha', costo: 18000, tipo: 'doble' },
        { id: 'completo', nombre: 'Todas las Zonas (Frente, Espalda y Mangas)', costo: 35000, tipo: 'cuadruple' }
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
        if (files.length + imagenes.length > 3) {
            alert('Puedes subir como máximo 3 imágenes.');
            return;
        }

        const nuevasImagenes = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImagenes(prev => [...prev, ...nuevasImagenes].slice(0, 3));
    };

    const eliminarImagen = (index) => {
        URL.revokeObjectURL(imagenes[index].preview);
        setImagenes(prev => prev.filter((_, i) => i !== index));
    };

    // Estructurar objeto final y volver al catálogo
    const guardarEstampadoEnItem = () => {
        const tipoUbicacion = ubicaciones.find(u => u.id === ubicacion)?.tipo;

        let frases = {};
        if (tipoUbicacion === 'simple') {
            frases = { principal: textoSimple };
        } else if (tipoUbicacion === 'doble') {
            frases = { ladoA: textoLadoA, ladoB: textoLadoB };
        } else if (tipoUbicacion === 'cuadruple') {
            frases = { adelante: textoAdelante, atras: textoAtras, mangaIzq: textoMangaIzq, mangaDer: textoMangaDer };
        }

        const precioBase = producto?.precio || 0;
        const precioTotal = precioBase + precioExtra;

        const datosEstampado = {
            ubicacion,
            colorTinta,
            notas,
            costoExtra: precioExtra,
            precioTotalFinal: precioTotal,
            frases,
            imagenes: imagenes.map(img => img.preview)
        };

        navigate('/catalogo', { 
            state: { 
                productoActualizado: { 
                    ...producto, 
                    precioTotalFinal: precioTotal,
                    estampado: datosEstampado 
                } 
            } 
        });
    };

    const tipoActual = ubicaciones.find(u => u.id === ubicacion)?.tipo || 'simple';
    const precioBasePrenda = producto?.precio || 0;
    const precioTotalPrenda = precioBasePrenda + precioExtra;

    return (
        <div style={{ backgroundColor: '#09090b', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', maxWidth: '1100px', backgroundColor: '#121215', padding: '2rem', borderRadius: '1rem', border: '1px solid #27272a' }}>
                
                {/* COLUMNA IZQUIERDA: Visor 3D */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ color: 'white', margin: 0, fontWeight: '900', textTransform: 'uppercase' }}>👁️ Previsualización 3D</h3>
                    <Canvas3D 
                        ubicacion={ubicacion}
                        imagenes={imagenes.map(img => img.preview)}
                        frases={
                            tipoActual === 'simple' ? { principal: textoSimple } :
                            tipoActual === 'doble' ? { ladoA: textoLadoA, ladoB: textoLadoB } :
                            { adelante: textoAdelante, atras: textoAtras, mangaIzq: textoMangaIzq, mangaDer: textoMangaDer }
                        }
                        colorTinta={colorTinta}
                        colorPrenda={colorPrendaHex}
                    />
                </div>

                {/* COLUMNA DERECHA: Formulario */}
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '1rem', padding: '2rem', boxSizing: 'border-box', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
                    
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
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>2. Sube tus diseños (Máx 3 imágenes):</label>
                            <input type="file" accept="image/png, image/jpeg, image/webp" multiple onChange={manejarSeleccionImagenes} style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.5rem', borderRadius: '0.4rem', fontSize: '0.8rem' }} />
                            
                            {/* Previsualización de imágenes */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                {imagenes.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                        <img src={img.preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.3rem', border: '1px solid #3f3f46' }} />
                                        <button onClick={() => eliminarImagen(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Frases de Estampado */}
                        <div>
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>3. Frase del estampado (opcional):</label>
                            
                            {tipoActual === 'simple' && (
                                <div>
                                    <input type="text" value={textoSimple} onChange={(e) => setTextoSimple(e.target.value)} placeholder="Ej: Estilo Urbano 2026" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                </div>
                            )}

                            {tipoActual === 'doble' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Zona 1 / Izquierda / Adelante:</span>
                                        <input type="text" value={textoLadoA} onChange={(e) => setTextoLadoA(e.target.value)} placeholder="Frase para esta zona" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Zona 2 / Derecha / Atrás:</span>
                                        <input type="text" value={textoLadoB} onChange={(e) => setTextoLadoB(e.target.value)} placeholder="Frase para la otra zona" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                    </div>
                                </div>
                            )}

                            {tipoActual === 'cuadruple' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Adelante (Pecho):</span>
                                        <input type="text" value={textoAdelante} onChange={(e) => setTextoAdelante(e.target.value)} placeholder="Texto para el frente" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Atrás (Espalda):</span>
                                        <input type="text" value={textoAtras} onChange={(e) => setTextoAtras(e.target.value)} placeholder="Texto para la espalda" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Manga Izquierda:</span>
                                        <input type="text" value={textoMangaIzq} onChange={(e) => setTextoMangaIzq(e.target.value)} placeholder="Texto manga izquierda" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                    </div>
                                    <div>
                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Frase Manga Derecha:</span>
                                        <input type="text" value={textoMangaDer} onChange={(e) => setTextoMangaDer(e.target.value)} placeholder="Texto manga derecha" style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Tinta */}
                        <div>
                            <label style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>4. Color de la tinta:</label>
                            <select value={colorTinta} onChange={(e) => setColorTinta(e.target.value)} style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', color: 'white', padding: '0.6rem', borderRadius: '0.4rem' }}>
                                <option value="Blanco">Blanco Matte</option>
                                <option value="Negro">Negro Profundo</option>
                                <option value="Dorado">Dorado Brillante</option>
                            </select>
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