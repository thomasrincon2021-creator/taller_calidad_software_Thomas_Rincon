import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { obtenerProductos } from '../../services/productoService';
import '../../App.css';


// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

const aplicarEstiloCelda = (celda, esEncabezado = false) => {
    celda.s = {
        font: {
            bold: esEncabezado,
            color: esEncabezado ? 'FFFFFF' : '000000'
        },
        fill: {
            fgColor: {
                rgb: esEncabezado ? '111111' : 'FFFFFF'
            }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center'
        },
        border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } }
        }
    };
};


// =====================================================
// EXPORTAR EXCEL
// =====================================================

const exportarExcel = (productos, nombreArchivo = 'reporte-inventario.xlsx') => {

    const datos = productos.map((producto) => ({
        ID: producto.id,
        Producto: producto.nombre,
        Categoria: producto.categoria,
        Precio: producto.precio,
        Stock: obtenerStockTotal(producto),
        Estado:
            obtenerStockTotal(producto) === 0
                ? 'AGOTADO'
                : obtenerStockCritico(producto)
                    ? 'STOCK CRÍTICO'
                    : 'DISPONIBLE'
    }));

    const encabezados = [
        ['NOWSTYLE'],
        ['Reporte de Inventario'],
        ['Generado por el sistema'],
        [],
        ['ID', 'Producto', 'Categoria', 'Precio', 'Stock', 'Estado']
    ];

    const hoja = XLSX.utils.aoa_to_sheet(encabezados);

    XLSX.utils.sheet_add_json(hoja, datos, {
        origin: 'A6',
        skipHeader: true
    });

    hoja['!cols'] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 }
    ];

    // Estilo de encabezados
    for (let col = 0; col < 6; col++) {
        const celda = hoja[XLSX.utils.encode_cell({
            r: 4,
            c: col
        })];

        if (celda) {
            aplicarEstiloCelda(celda, true);
        }
    }

    // Estilo de datos
    for (let fila = 5; fila < datos.length + 5; fila++) {
        for (let col = 0; col < 6; col++) {
            const celda = hoja[XLSX.utils.encode_cell({
                r: fila,
                c: col
            })];

            if (celda) {
                aplicarEstiloCelda(celda, false);
            }
        }
    }

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        libro,
        hoja,
        'Inventario'
    );

    XLSX.writeFile(
        libro,
        nombreArchivo
    );
};


// =====================================================
// EXPORTAR PDF
// =====================================================

const exportarPdf = (productos) => {

    const doc = new jsPDF();

    doc.setFillColor(17, 17, 17);
    doc.rect(
        0,
        0,
        210,
        297,
        'F'
    );

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');

    doc.text(
        'NOWSTYLE',
        20,
        25
    );

    doc.setFontSize(13);
    doc.setFont(undefined, 'normal');

    doc.text(
        'Reporte de Ventas',
        20,
        35
    );

    // ============================
    // CALCULOS
    // ============================

    let totalVentas = 0;
    let totalUnidades = 0;

    productos.forEach((producto) => {

        const stock = obtenerStockTotal(producto);

        totalUnidades += stock;

        const precio = Number(producto.precio) || 0;

        totalVentas += precio * stock;
    });

    // ============================
    // TARJETAS
    // ============================

    doc.setFillColor(220, 38, 38);

    doc.roundedRect(
        20,
        50,
        50,
        30,
        4,
        4,
        'F'
    );

    doc.setFillColor(45, 45, 45);

    doc.roundedRect(
        80,
        50,
        50,
        30,
        4,
        4,
        'F'
    );

    doc.roundedRect(
        140,
        50,
        50,
        30,
        4,
        4,
        'F'
    );

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(9);

    doc.text(
        'PRODUCTOS',
        45,
        60,
        { align: 'center' }
    );

    doc.text(
        'UNIDADES',
        105,
        60,
        { align: 'center' }
    );

    doc.text(
        'VENTAS',
        165,
        60,
        { align: 'center' }
    );

    doc.setFontSize(13);

    doc.text(
        String(productos.length),
        45,
        71,
        { align: 'center' }
    );

    doc.text(
        String(totalUnidades),
        105,
        71,
        { align: 'center' }
    );

    doc.text(
        formatearMoneda(totalVentas),
        165,
        71,
        { align: 'center' }
    );

    // ============================
    // TABLA
    // ============================

    let y = 100;

    doc.setFontSize(9);

    doc.setFillColor(220, 38, 38);

    doc.rect(
        20,
        y,
        170,
        10,
        'F'
    );

    doc.setTextColor(255, 255, 255);

    doc.text(
        'PRODUCTO',
        25,
        y + 7
    );

    doc.text(
        'CATEGORIA',
        90,
        y + 7
    );

    doc.text(
        'PRECIO',
        140,
        y + 7
    );

    doc.text(
        'STOCK',
        175,
        y + 7
    );

    y += 15;

    doc.setTextColor(255, 255, 255);

    productos.forEach((producto) => {

        if (y > 275) {
            doc.addPage();

            doc.setFillColor(17, 17, 17);

            doc.rect(
                0,
                0,
                210,
                297,
                'F'
            );

            y = 20;
        }

        const nombre = producto.nombre || 'Sin nombre';

        const categoria =
            producto.categoria || 'Sin categoría';

        const precio =
            formatearMoneda(producto.precio);

        const stock =
            obtenerStockTotal(producto);

        doc.text(
            nombre.substring(0, 28),
            25,
            y
        );

        doc.text(
            categoria.substring(0, 20),
            90,
            y
        );

        doc.text(
            precio,
            140,
            y
        );

        doc.text(
            String(stock),
            175,
            y
        );

        y += 9;
    });

    doc.save(
        'reporte-ventas-nowstyle.pdf'
    );
};


// =====================================================
// FORMATEAR FECHA
// =====================================================

const formatearFecha = (fecha) => {

    if (!fecha) {
        return 'Sin fecha';
    }

    return new Date(fecha).toLocaleDateString(
        'es-CO'
    );
};


// =====================================================
// FORMATEAR MONEDA
// =====================================================

const formatearMoneda = (valor) => {

    return new Intl.NumberFormat(
        'es-CO',
        {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }
    ).format(Number(valor) || 0);
};


// =====================================================
// OBTENER STOCK TOTAL
// =====================================================

const obtenerStockTotal = (producto) => {

    if (!producto || !producto.tallasStock) {
        return 0;
    }

    try {

        return producto.tallasStock
            .split(',')
            .reduce((total, item) => {

                const partes = item.split(':');

                if (partes.length !== 2) {
                    return total;
                }

                const cantidad =
                    parseInt(partes[1].trim()) || 0;

                return total + cantidad;

            }, 0);

    } catch (error) {

        console.error(
            'Error obteniendo stock:',
            error
        );

        return 0;
    }
};


// =====================================================
// STOCK CRÍTICO
// =====================================================

const obtenerStockCritico = (producto) => {

    if (!producto || !producto.tallasStock) {
        return true;
    }

    try {

        const cantidades =
            producto.tallasStock
                .split(',')
                .map((item) => {

                    const partes =
                        item.split(':');

                    return parseInt(
                        partes[1]?.trim()
                    ) || 0;

                });

        return cantidades.some(
            (cantidad) => cantidad <= 5
        );

    } catch (error) {

        return true;
    }
};


// =====================================================
// PANEL EMPLEADO
// =====================================================

export default function PanelEmpleado() {

    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    const usuarioNombre =
        localStorage.getItem('usuarioNombre') ||
        'Empleado';


    // =================================================
    // CARGAR PRODUCTOS
    // =================================================

    useEffect(() => {

        const cargarProductos = async () => {

            try {

                setLoading(true);

                const respuesta =
                    await obtenerProductos();

                setProductos(
                    Array.isArray(respuesta)
                        ? respuesta
                        : []
                );

            } catch (err) {

                console.error(err);

                setError(
                    'No se pudieron cargar los productos.'
                );

            } finally {

                setLoading(false);
            }
        };

        cargarProductos();

    }, []);


    // =================================================
    // METRICAS
    // =================================================

    const totalProductos =
        productos.length;

    const productosStockCritico =
        productos.filter(
            (producto) =>
                obtenerStockCritico(producto)
        ).length;


    // =================================================
    // REPORTES
    // =================================================

    const descargarReporte = async (tipo) => {

        try {

            if (tipo === 'inventario') {

                exportarExcel(
                    productos,
                    'estado-inventario-nowstyle.xlsx'
                );

                return;
            }


            if (tipo === 'critico') {

                const productosCriticos =
                    productos.filter(
                        (producto) =>
                            obtenerStockCritico(producto)
                    );

                exportarExcel(
                    productosCriticos,
                    'alertas-stock-critico-nowstyle.xlsx'
                );

                return;
            }


            if (tipo === 'ventas') {

                const respuesta =
                    await fetch(
                        'http://localhost:8080/api/pedidos'
                    );

                if (!respuesta.ok) {
                    throw new Error(
                        'No se pudo obtener el reporte de ventas'
                    );
                }

                const pedidos =
                    await respuesta.json();

                let totalVentas = 0;
                let totalUnidades = 0;

                pedidos.forEach((pedido) => {

                    if (pedido.total) {

                        totalVentas +=
                            Number(pedido.total);
                    }

                    if (pedido.detalles) {

                        pedido.detalles.forEach(
                            (detalle) => {

                                totalUnidades +=
                                    Number(
                                        detalle.cantidad
                                    ) || 0;

                            }
                        );
                    }

                });

                const doc = new jsPDF();

                doc.setFontSize(22);

                doc.text(
                    'NOWSTYLE',
                    20,
                    25
                );

                doc.setFontSize(14);

                doc.text(
                    'Reporte de Ventas',
                    20,
                    35
                );

                doc.setFontSize(11);

                doc.text(
                    `Fecha: ${formatearFecha(
                        new Date()
                    )}`,
                    20,
                    47
                );

                doc.text(
                    `Pedidos registrados: ${pedidos.length}`,
                    20,
                    60
                );

                doc.text(
                    `Unidades vendidas: ${totalUnidades}`,
                    20,
                    70
                );

                doc.text(
                    `Total de ventas: ${formatearMoneda(
                        totalVentas
                    )}`,
                    20,
                    80
                );

                doc.save(
                    'reporte-ventas-nowstyle.pdf'
                );

                return;
            }

        } catch (err) {

            console.error(err);

            alert(
                'No se pudo generar el reporte.'
            );
        }
    };


    // =================================================
    // ESTILOS
    // =================================================

    const tarjetaGestion = {
        background:
            'linear-gradient(145deg, #171717, #0d0d0d)',

        border:
            '1px solid #2a2a2a',

        borderRadius:
            '16px',

        minHeight:
            '150px',

        padding:
            '24px',

        display:
            'flex',

        flexDirection:
            'column',

        justifyContent:
            'space-between',

        cursor:
            'pointer',

        transition:
            'all 0.25s ease',

        boxSizing:
            'border-box'
    };


    const tarjetaGestionRoja = {
        ...tarjetaGestion,

        background:
            'linear-gradient(145deg, #dc2626, #991b1b)',

        border:
            '1px solid #ef4444'
    };


    // =================================================
    // RETURN
    // =================================================

    return (

        <div
            style={{
                minHeight: '100vh',
                background: '#050505',
                color: '#ffffff',
                fontFamily:
                    'Arial, Helvetica, sans-serif'
            }}
        >

            {/* =========================================
                NAVBAR
            ========================================= */}

            <nav
                style={{
                    height: '70px',
                    background: '#0d0d0d',
                    borderBottom:
                        '1px solid #242424',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 5%',
                    boxSizing: 'border-box'
                }}
            >

                <div
                    style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        letterSpacing: '1px'
                    }}
                >
                    NOWSTYLE
                    <span
                        style={{
                            color: '#dc2626'
                        }}
                    >
                        {' '}EMPLEADO
                    </span>
                </div>


                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}
                >

                    <div
                        style={{
                            textAlign: 'right'
                        }}
                    >

                        <div
                            style={{
                                fontSize: '13px',
                                color: '#888'
                            }}
                        >
                            SESIÓN
                        </div>

                        <div
                            style={{
                                fontWeight: 'bold'
                            }}
                        >
                            {usuarioNombre}
                        </div>

                    </div>


                    <button
                        onClick={() =>
                            navigate('/catalogo')
                        }
                        style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding:
                                '11px 18px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🛒 Ir al Catálogo
                    </button>

                </div>

            </nav>


            {/* =========================================
                CONTENIDO
            ========================================= */}

            <main
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '45px 25px 60px'
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        marginBottom: '35px'
                    }}
                >

                    <div
                        style={{
                            color: '#dc2626',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            marginBottom: '8px'
                        }}
                    >
                        ADMINISTRACIÓN
                    </div>

                    <h1
                        style={{
                            fontSize: '38px',
                            margin: 0,
                            fontWeight: '800'
                        }}
                    >
                        Panel de Empleado
                    </h1>

                    <p
                        style={{
                            color: '#888',
                            marginTop: '10px',
                            fontSize: '15px'
                        }}
                    >
                        Gestiona productos, inventario,
                        pedidos y reportes de NowStyle.
                    </p>

                </div>


                {/* =====================================
                    METRICAS
                ===================================== */}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(2, minmax(0, 1fr))',
                        gap: '20px',
                        marginBottom: '45px'
                    }}
                >

                    <div
                        style={{
                            background: '#111',
                            border:
                                '1px solid #292929',
                            borderRadius: '14px',
                            padding: '25px'
                        }}
                    >

                        <div
                            style={{
                                color: '#888',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                letterSpacing: '1px'
                            }}
                        >
                            PRODUCTOS REGISTRADOS
                        </div>

                        <div
                            style={{
                                fontSize: '34px',
                                fontWeight: '800',
                                marginTop: '8px'
                            }}
                        >
                            {loading
                                ? '...'
                                : totalProductos}
                        </div>

                    </div>


                    <div
                        style={{
                            background: '#111',
                            border:
                                '1px solid #292929',
                            borderRadius: '14px',
                            padding: '25px'
                        }}
                    >

                        <div
                            style={{
                                color: '#888',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                letterSpacing: '1px'
                            }}
                        >
                            STOCK CRÍTICO
                        </div>

                        <div
                            style={{
                                fontSize: '34px',
                                fontWeight: '800',
                                marginTop: '8px',
                                color:
                                    productosStockCritico > 0
                                        ? '#ef4444'
                                        : '#22c55e'
                            }}
                        >
                            {loading
                                ? '...'
                                : productosStockCritico}
                        </div>

                    </div>

                </div>


                {/* =====================================
                    GESTIÓN OPERATIVA
                ===================================== */}

                <section>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px'
                        }}
                    >

                        <div
                            style={{
                                width: '4px',
                                height: '25px',
                                background: '#dc2626',
                                borderRadius: '5px'
                            }}
                        />

                        <h2
                            style={{
                                margin: 0,
                                fontSize: '22px'
                            }}
                        >
                            Gestión Operativa
                        </h2>

                    </div>


                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(230px, 1fr))',
                            gap: '18px'
                        }}
                    >

                        {/* CREAR PRODUCTO */}

                        <div
                            style={tarjetaGestionRoja}
                            onClick={() =>
                                navigate('/crear-producto')
                            }
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(-4px)';
                                e.currentTarget.style.boxShadow =
                                    '0 10px 30px rgba(220,38,38,0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(0)';
                                e.currentTarget.style.boxShadow =
                                    'none';
                            }}
                        >

                            <div
                                style={{
                                    fontSize: '32px'
                                }}
                            >
                                ➕
                            </div>

                            <div>

                                <h3
                                    style={{
                                        margin:
                                            '0 0 7px',
                                        fontSize: '18px'
                                    }}
                                >
                                    Crear Producto
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#eee',
                                        fontSize: '13px',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    Registra nuevos productos
                                    en el catálogo.
                                </p>

                            </div>

                        </div>


                        {/* INVENTARIO */}

                        <div
                            style={tarjetaGestion}
                            onClick={() =>
                                navigate('/inventario')
                            }
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(-4px)';
                                e.currentTarget.style.borderColor =
                                    '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(0)';
                                e.currentTarget.style.borderColor =
                                    '#2a2a2a';
                            }}
                        >

                            <div
                                style={{
                                    fontSize: '32px'
                                }}
                            >
                                📦
                            </div>

                            <div>

                                <h3
                                    style={{
                                        margin:
                                            '0 0 7px',
                                        fontSize: '18px'
                                    }}
                                >
                                    Gestionar Inventario
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#999',
                                        fontSize: '13px',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    Consulta y actualiza
                                    existencias.
                                </p>

                            </div>

                        </div>


                        {/* PEDIDOS */}

                        <div
                            style={tarjetaGestion}
                            onClick={() =>
                                navigate(
                                    '/historial-pedidos?vista=admin'
                                )
                            }
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(-4px)';
                                e.currentTarget.style.borderColor =
                                    '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    'translateY(0)';
                                e.currentTarget.style.borderColor =
                                    '#2a2a2a';
                            }}
                        >

                            <div
                                style={{
                                    fontSize: '32px'
                                }}
                            >
                                🛍️
                            </div>

                            <div>

                                <h3
                                    style={{
                                        margin:
                                            '0 0 7px',
                                        fontSize: '18px'
                                    }}
                                >
                                    Pedidos y Chat
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#999',
                                        fontSize: '13px',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    Administra pedidos y
                                    comunicación con clientes.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    REPORTES
                ===================================== */}

                <section
                    style={{
                        marginTop: '45px'
                    }}
                >

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px'
                        }}
                    >

                        <div
                            style={{
                                width: '4px',
                                height: '25px',
                                background: '#dc2626',
                                borderRadius: '5px'
                            }}
                        />

                        <h2
                            style={{
                                margin: 0,
                                fontSize: '22px'
                            }}
                        >
                            Reportes
                        </h2>

                    </div>


                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '15px'
                        }}
                    >

                        <button
                            onClick={() =>
                                descargarReporte(
                                    'inventario'
                                )
                            }
                            style={{
                                background: '#111',
                                color: '#fff',
                                border:
                                    '1px solid #292929',
                                borderRadius: '10px',
                                padding: '17px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                textAlign: 'left'
                            }}
                        >
                            📊 Estado del Inventario
                            <div
                                style={{
                                    color: '#777',
                                    fontSize: '12px',
                                    marginTop: '5px',
                                    fontWeight: 'normal'
                                }}
                            >
                                Descargar Excel
                            </div>
                        </button>


                        <button
                            onClick={() =>
                                descargarReporte(
                                    'critico'
                                )
                            }
                            style={{
                                background: '#111',
                                color: '#fff',
                                border:
                                    '1px solid #292929',
                                borderRadius: '10px',
                                padding: '17px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                textAlign: 'left'
                            }}
                        >
                            ⚠️ Stock Crítico
                            <div
                                style={{
                                    color: '#777',
                                    fontSize: '12px',
                                    marginTop: '5px',
                                    fontWeight: 'normal'
                                }}
                            >
                                Descargar alertas
                            </div>
                        </button>


                        <button
                            onClick={() =>
                                descargarReporte(
                                    'ventas'
                                )
                            }
                            style={{
                                background: '#111',
                                color: '#fff',
                                border:
                                    '1px solid #292929',
                                borderRadius: '10px',
                                padding: '17px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                textAlign: 'left'
                            }}
                        >
                            📈 Reporte de Ventas
                            <div
                                style={{
                                    color: '#777',
                                    fontSize: '12px',
                                    marginTop: '5px',
                                    fontWeight: 'normal'
                                }}
                            >
                                Descargar PDF
                            </div>
                        </button>

                    </div>

                </section>


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div
                        style={{
                            marginTop: '25px',
                            padding: '15px',
                            background: '#2a1111',
                            border:
                                '1px solid #7f1d1d',
                            borderRadius: '10px',
                            color: '#fca5a5'
                        }}
                    >
                        {error}
                    </div>

                )}

            </main>

        </div>
    );
}