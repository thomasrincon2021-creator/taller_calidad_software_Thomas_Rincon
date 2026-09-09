import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { obtenerProductos } from '../../services/productoService';
import '../../App.css';

const descargarArchivo = (nombreArchivo, contenido, tipoMime) => {
  const blob = new Blob([contenido], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = nombreArchivo;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const aplicarEstiloCelda = (hoja, fila, columna, estilo) => {
  const referencia = XLSX.utils.encode_cell({
    r: fila,
    c: columna
  });

  if (!hoja[referencia]) {
    hoja[referencia] = {};
  }

  hoja[referencia].s = {
    ...hoja[referencia].s,
    ...estilo
  };
};

const exportarExcel = (
  nombreArchivo,
  headers,
  rows,
  titulo = 'Reporte'
) => {
  const workbook = XLSX.utils.book_new();

  const hoja = XLSX.utils.aoa_to_sheet([
    [titulo],
    ['Generado por NowStyle'],
    [],
    headers,
    ...rows
  ]);

  hoja['!merges'] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: headers.length - 1 }
    },
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: headers.length - 1 }
    }
  ];

  hoja['!cols'] = headers.map((header, index) => {
    const ancho = Math.max(
      header.length,
      ...rows.map(row =>
        String(row[index] ?? '').length
      )
    ) + 2;

    return {
      wch: Math.min(ancho, 28)
    };
  });

  hoja['!showGridLines'] = true;

  aplicarEstiloCelda(hoja, 0, 0, {
    fill: {
      fgColor: {
        rgb: 'FFDC2626'
      }
    },

    font: {
      bold: true,
      color: {
        rgb: 'FFFFFFFF'
      },
      sz: 16
    },

    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },

    border: {
      top: {
        style: 'thin',
        color: {
          rgb: 'FFDC2626'
        }
      },
      bottom: {
        style: 'thin',
        color: {
          rgb: 'FFDC2626'
        }
      },
      left: {
        style: 'thin',
        color: {
          rgb: 'FFDC2626'
        }
      },
      right: {
        style: 'thin',
        color: {
          rgb: 'FFDC2626'
        }
      }
    }
  });

  aplicarEstiloCelda(hoja, 1, 0, {
    font: {
      italic: true,
      color: {
        rgb: 'FFB0B5BA'
      },
      sz: 10
    },

    alignment: {
      horizontal: 'center',
      vertical: 'center'
    }
  });

  const filaCabecera = 3;

  headers.forEach((header, index) => {
    aplicarEstiloCelda(
      hoja,
      filaCabecera,
      index,
      {
        fill: {
          fgColor: {
            rgb: 'FF1F2937'
          }
        },

        font: {
          bold: true,
          color: {
            rgb: 'FFFFFFFF'
          },
          sz: 10
        },

        alignment: {
          horizontal: 'center',
          vertical: 'center'
        },

        border: {
          top: {
            style: 'thin',
            color: {
              rgb: 'FF374151'
            }
          },
          bottom: {
            style: 'thin',
            color: {
              rgb: 'FF374151'
            }
          },
          left: {
            style: 'thin',
            color: {
              rgb: 'FF374151'
            }
          },
          right: {
            style: 'thin',
            color: {
              rgb: 'FF374151'
            }
          }
        }
      }
    );
  });

  rows.forEach((row, rowIndex) => {
    const filaDatos =
      filaCabecera + rowIndex + 1;

    row.forEach((cell, columnIndex) => {
      const referencia =
        XLSX.utils.encode_cell({
          r: filaDatos,
          c: columnIndex
        });

      hoja[referencia] = {
        v: cell,
        t:
          typeof cell === 'number'
            ? 'n'
            : 's',

        s: {
          fill: {
            fgColor: {
              rgb:
                rowIndex % 2 === 0
                  ? 'FFF8FAFC'
                  : 'FFFAFAFA'
            }
          },

          border: {
            top: {
              style: 'thin',
              color: {
                rgb: 'FFE5E7EB'
              }
            },
            bottom: {
              style: 'thin',
              color: {
                rgb: 'FFE5E7EB'
              }
            },
            left: {
              style: 'thin',
              color: {
                rgb: 'FFE5E7EB'
              }
            },
            right: {
              style: 'thin',
              color: {
                rgb: 'FFE5E7EB'
              }
            }
          },

          alignment: {
            vertical: 'center'
          }
        }
      };
    });
  });

  hoja['!autofilter'] = {
    ref:
      `A${filaCabecera + 1}:` +
      `${XLSX.utils.encode_col(headers.length - 1)}` +
      `${filaCabecera + rows.length + 1}`
  };

  XLSX.utils.book_append_sheet(
    workbook,
    hoja,
    'Reporte'
  );

  XLSX.writeFile(
    workbook,
    nombreArchivo
  );
};

const exportarPdf = ({
  nombreArchivo,
  titulo,
  subtitulo,
  cards = [],
  headers = [],
  rows = []
}) => {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const margin = 40;

  let y = 40;

  doc.setFillColor(
    10,
    10,
    10
  );

  doc.rect(
    0,
    0,
    pageWidth,
    doc.internal.pageSize.getHeight(),
    'F'
  );

  doc.setFillColor(
    220,
    38,
    38
  );

  doc.roundedRect(
    margin,
    y,
    pageWidth - margin * 2,
    70,
    18,
    18,
    'F'
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(12);

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.text(
    'NOWSTYLE',
    margin + 24,
    y + 28
  );

  doc.setFontSize(24);

  doc.text(
    titulo,
    margin + 24,
    y + 52
  );

  doc.setFontSize(10);

  doc.setTextColor(
    228,
    228,
    231
  );

  doc.text(
    subtitulo,
    margin + 24,
    y + 68
  );

  y = 140;

  const cardWidth =
    (pageWidth - margin * 2 - 24) / 3;

  cards.forEach((card, index) => {
    const x =
      margin +
      index * (cardWidth + 12);

    doc.setFillColor(
      24,
      24,
      27
    );

    doc.roundedRect(
      x,
      y,
      cardWidth,
      58,
      12,
      12,
      'F'
    );

    doc.setDrawColor(
      63,
      63,
      70
    );

    doc.setLineWidth(1);

    doc.roundedRect(
      x,
      y,
      cardWidth,
      58,
      12,
      12,
      'S'
    );

    doc.setTextColor(
      161,
      161,
      170
    );

    doc.setFontSize(9);

    doc.text(
      String(card.label).toUpperCase(),
      x + 14,
      y + 22
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(20);

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.text(
      String(card.value),
      x + 14,
      y + 42
    );
  });

  y = 230;

  const tableStartX = margin;

  let currentY = y;

  doc.setFillColor(
    24,
    24,
    27
  );

  doc.roundedRect(
    tableStartX,
    y,
    pageWidth - margin * 2,
    24,
    8,
    8,
    'F'
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(9);

  doc.setFont(
    'helvetica',
    'bold'
  );

  const columnWidths =
    headers.map((_, index) => {
      const maxLength =
        Math.max(
          headers[index].length,
          ...rows.map(row =>
            String(
              row[index] ?? ''
            ).length
          )
        );

      return Math.max(
        70,
        Math.min(
          150,
          maxLength * 7
        )
      );
    });

  let x =
    tableStartX + 14;

  headers.forEach(
    (header, index) => {
      doc.text(
        String(header),
        x,
        y + 16
      );

      x +=
        columnWidths[index];
    }
  );

  currentY =
    y + 30;

  doc.setTextColor(
    229,
    229,
    229
  );

  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(8);

  rows.forEach(row => {
    if (currentY > 760) {
      doc.addPage();
      currentY = 40;
    }

    let lineX =
      tableStartX + 14;

    row.forEach(
      (cell, index) => {
        const texto =
          String(cell ?? '');

        const textoEscapado =
          texto.length > 38
            ? `${texto.slice(0, 35)}...`
            : texto;

        doc.text(
          textoEscapado,
          lineX,
          currentY + 12
        );

        lineX +=
          columnWidths[index];
      }
    );

    currentY += 18;
  });

  doc.save(
    nombreArchivo
  );
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return 'Sin fecha';
  }

  const fechaObj =
    new Date(fecha);

  return Number.isNaN(
    fechaObj.getTime()
  )
    ? fecha
    : fechaObj.toLocaleString(
        'es-CO'
      );
};

const formatearMoneda = (valor) => {
  const numero =
    Number(valor || 0);

  return new Intl.NumberFormat(
    'es-CO',
    {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }
  ).format(numero);
};

const obtenerStockTotal = (producto) => {
  if (!producto?.tallasStock) {
    return 0;
  }

  return producto.tallasStock
    .split(',')
    .map(par => par.trim())
    .filter(Boolean)
    .reduce(
      (acumulado, par) => {
        const partes =
          par.split(':');

        if (partes.length < 2) {
          return acumulado;
        }

        const cantidad =
          Number(
            partes[1]?.trim()
          );

        return (
          acumulado +
          (
            Number.isFinite(cantidad)
              ? cantidad
              : 0
          )
        );
      },
      0
    );
};

const obtenerStockCritico = (producto) => {
  if (!producto?.tallasStock) {
    return true;
  }

  return producto.tallasStock
    .split(',')
    .map(par => par.trim())
    .filter(Boolean)
    .some(par => {
      const partes =
        par.split(':');

      if (partes.length < 2) {
        return false;
      }

      const cantidad =
        Number(
          partes[1]?.trim()
        );

      return (
        Number.isFinite(cantidad) &&
        cantidad <= 5
      );
    });
};

export default function PanelControl() {
  const navigate =
    useNavigate();

  const usuarioRol =
    localStorage.getItem(
      'usuarioRol'
    );

  const usuarioNombre =
    localStorage.getItem(
      'usuarioNombre'
    );

  const [productos, setProductos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [mensajeReporte, setMensajeReporte] =
    useState('');

  useEffect(() => {
    obtenerProductos()
      .then(data => {
        setProductos(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(
          'Error al obtener productos para el panel:',
          err
        );

        setLoading(false);
      });
  }, []);

  // =========================================================
  // CÁLCULOS DEL PANEL
  // =========================================================

  const totalProductos =
    productos.length;

  const categoriasUnicas =
    new Set(
      productos
        .map(
          p =>
            (p.categoria || '')
              .toLowerCase()
              .trim()
        )
        .filter(Boolean)
    ).size;

  const productosStockCritico =
    productos.filter(p => {
      if (!p.tallasStock) {
        return true;
      }

      const pares =
        p.tallasStock.split(',');

      return pares.some(par => {
        const partes =
          par.split(':');

        if (partes.length < 2) {
          return false;
        }

        const cant =
          parseInt(
            partes[1].trim(),
            10
          );

        return (
          !isNaN(cant) &&
          cant <= 5
        );
      });
    });

  // =========================================================
  // REPORTES
  // =========================================================

  const descargarReporte =
    async (tipo) => {
      setMensajeReporte(
        `Generando reporte de ${tipo}... 📄`
      );

      try {
        // INVENTARIO
        if (
          tipo ===
          'Estado del Inventario'
        ) {
          const headers = [
            'ID',
            'Nombre',
            'Categoría',
            'Color',
            'Precio',
            'Stock Total',
            'Tallas y Stock'
          ];

          const rows =
            productos.map(
              producto => [
                producto.id || '',

                producto.nombre ||
                  'Sin nombre',

                producto.categoria ||
                  'Sin categoría',

                producto.color ||
                  'Sin color',

                formatearMoneda(
                  producto.precio
                ),

                obtenerStockTotal(
                  producto
                ),

                producto.tallasStock ||
                  'Sin registro'
              ]
            );

          exportarExcel(
            'estado-inventario.xlsx',
            headers,
            rows,
            'Estado del Inventario'
          );
        }

        // ALERTAS
        if (
          tipo ===
          'Alertas de Stock Crítico'
        ) {
          const headers = [
            'ID',
            'Nombre',
            'Categoría',
            'Stock Total',
            'Tallas y Stock'
          ];

          const rows =
            productos
              .filter(producto =>
                obtenerStockCritico(
                  producto
                )
              )
              .map(producto => [
                producto.id || '',

                producto.nombre ||
                  'Sin nombre',

                producto.categoria ||
                  'Sin categoría',

                obtenerStockTotal(
                  producto
                ),

                producto.tallasStock ||
                  'Sin registro'
              ]);

          exportarExcel(
            'alertas-stock-critico.xlsx',
            headers,
            rows,
            'Alertas de Stock Crítico'
          );
        }

        // REPORTE DE VENTAS
        if (
          tipo ===
          'Reporte de Ventas'
        ) {
          const response =
            await fetch(
              'http://localhost:8080/api/pedidos'
            );

          if (!response.ok) {
            throw new Error(
              'No se pudieron cargar los pedidos para el reporte de ventas.'
            );
          }

          const pedidos =
            await response.json();

          const totalVentas =
            pedidos.reduce(
              (acumulado, pedido) =>
                acumulado +
                Number(
                  pedido.total || 0
                ),
              0
            );

          const totalPedidos =
            pedidos.length;

          const totalUnidades =
            pedidos.reduce(
              (acumulado, pedido) =>
                acumulado +
                (
                  pedido.items || []
                ).reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      item.cantidad || 0
                    ),
                  0
                ),
              0
            );

          const headers = [
            'Pedido',
            'Fecha',
            'Usuario',
            'Estado',
            'Unidades',
            'Total'
          ];

          const rows =
            pedidos.map(
              pedido => {
                const unidades =
                  (
                    pedido.items || []
                  ).reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.cantidad || 0
                      ),
                    0
                  );

                const total =
                  Number(
                    pedido.total || 0
                  );

                return [
                  `#${pedido.id}`,

                  formatearFecha(
                    pedido.fecha
                  ),

                  pedido.usuarioEmail ||
                    'Sin email',

                  pedido.estado ||
                    'PENDIENTE',

                  unidades,

                  formatearMoneda(
                    total
                  )
                ];
              }
            );

          exportarPdf({
            nombreArchivo:
              'reporte-ventas.pdf',

            titulo:
              'Reporte de Ventas',

            subtitulo:
              `Generado el ${formatearFecha(
                new Date().toISOString()
              )}`,

            cards: [
              {
                label: 'Pedidos',
                value: totalPedidos
              },
              {
                label: 'Unidades',
                value: totalUnidades
              },
              {
                label: 'Ingresos',
                value:
                  formatearMoneda(
                    totalVentas
                  )
              }
            ],

            headers,
            rows
          });
        }

        setMensajeReporte(
          `Reporte de ${tipo} descargado.`
        );

        window.setTimeout(
          () =>
            setMensajeReporte(''),
          2600
        );
      } catch (error) {
        console.error(
          'Error al generar reporte:',
          error
        );

        setMensajeReporte(
          error.message ||
          'No se pudo generar el reporte solicitado.'
        );

        window.setTimeout(
          () =>
            setMensajeReporte(''),
          3600
        );
      }
    };

  // =========================================================
  // ESTILO DE LAS TARJETAS OPERATIVAS
  // =========================================================

  const estiloTarjeta = {
    width: '100%',
    height: '150px',
    minWidth: 0,
    boxSizing: 'border-box',

    padding: '1.25rem',

    borderRadius: '0.75rem',

    color: '#ffffff',
    cursor: 'pointer',
    textAlign: 'left',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    fontFamily: 'inherit',
    fontSize: 'inherit',

    appearance: 'none',
    WebkitAppearance: 'none',

    overflow: 'hidden',

    margin: 0
  };

  return (
    <div
      style={{
        backgroundColor: '#000000',
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        paddingBottom: '3rem'
      }}
    >

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className="navbar"
        style={{
          backgroundColor: '#09090b',
          borderBottom:
            '1px solid #27272a',

          padding: '1rem 2rem',

          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',

          gap: '1rem'
        }}
      >
        <div
          className="navbar-logo"
          style={{
            fontWeight: 900,
            fontSize: '1.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          Now
          <span
            style={{
              color: '#dc2626'
            }}
          >
            Style
          </span>
          {' '}ADMIN
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              color: '#a1a1aa'
            }}
          >
            👤 {usuarioNombre || 'Administrador'}
            {' '}
            (
            <strong
              style={{
                color: '#dc2626'
              }}
            >
              {usuarioRol || 'ADMIN'}
            </strong>
            )
          </span>

          <button
            onClick={() =>
              navigate('/catalogo')
            }
            style={{
              backgroundColor:
                '#27272a',

              border:
                '1px solid #3f3f46',

              color: '#ffffff',

              padding:
                '0.5rem 1rem',

              borderRadius:
                '0.5rem',

              cursor:
                'pointer',

              fontWeight:
                'bold',

              fontSize:
                '0.85rem',

              fontFamily:
                'inherit'
            }}
          >
            🛒 Ir al Catálogo
          </button>
        </div>
      </nav>


      {/* =====================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '2rem auto',
          padding: '0 1.5rem',
          boxSizing: 'border-box'
        }}
      >

        {/* ENCABEZADO */}

        <div
          style={{
            marginBottom: '2rem'
          }}
        >
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              margin: 0,
              textTransform: 'uppercase'
            }}
          >
            Panel de{' '}
            <span
              style={{
                color: '#dc2626'
              }}
            >
              Control
            </span>
          </h1>

          <p
            style={{
              color: '#a1a1aa',
              margin:
                '0.5rem 0 0 0'
            }}
          >
            Métricas e inventario
            sincronizados en tiempo real.
          </p>
        </div>


        {/* =================================================
            MÉTRICAS
        ================================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',

            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}
        >

          {/* PRODUCTOS */}

          <div
            style={{
              backgroundColor:
                '#09090b',

              border:
                '1px solid #27272a',

              borderRadius:
                '0.75rem',

              padding:
                '1.25rem',

              boxSizing:
                'border-box'
            }}
          >
            <span
              style={{
                color: '#a1a1aa',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform:
                  'uppercase'
              }}
            >
              PRODUCTOS REGISTRADOS
            </span>

            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: '#ffffff',
                marginTop: '0.5rem'
              }}
            >
              {loading
                ? '...'
                : totalProductos}
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#a1a1aa'
              }}
            >
              En {categoriasUnicas}
              {' '}
              categoría(s) activa(s)
            </span>
          </div>


          {/* STOCK */}

          <div
            style={{
              backgroundColor:
                '#09090b',

              border:
                '1px solid #27272a',

              borderRadius:
                '0.75rem',

              padding:
                '1.25rem',

              boxSizing:
                'border-box'
            }}
          >
            <span
              style={{
                color: '#a1a1aa',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform:
                  'uppercase'
              }}
            >
              STOCK CRÍTICO
            </span>

            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 900,

                color:
                  productosStockCritico.length > 0
                    ? '#ef4444'
                    : '#22c55e',

                marginTop:
                  '0.5rem'
              }}
            >
              {loading
                ? '...'
                : `${productosStockCritico.length} Prendas`}
            </div>

            <span
              style={{
                fontSize: '0.75rem',

                color:
                  productosStockCritico.length > 0
                    ? '#ef4444'
                    : '#22c55e'
              }}
            >
              {productosStockCritico.length > 0
                ? 'Con stock igual o menor a 5 unidades'
                : 'Stock en niveles óptimos'}
            </span>
          </div>
        </div>


        {/* =================================================
            GESTIÓN OPERATIVA
        ================================================== */}

        <h3
          style={{
            textTransform:
              'uppercase',

            fontSize:
              '1.1rem',

            fontWeight:
              800,

            marginBottom:
              '1rem',

            color:
              '#ffffff'
          }}
        >
          Gestión Operativa
        </h3>


        {/* GRID DE 4 TARJETAS */}

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(4, minmax(0, 1fr))',

            gap: '1.25rem',

            width: '100%',

            marginBottom:
              '2.5rem',

            alignItems:
              'stretch'
          }}
        >

          {/* CREAR PRODUCTO */}

          <button
            type="button"
            onClick={() =>
              navigate('/crear-producto')
            }
            style={{
              ...estiloTarjeta,

              backgroundColor:
                '#dc2626',

              border:
                '1px solid #dc2626'
            }}
          >
            <span
              style={{
                fontSize: '1.8rem',
                lineHeight: 1
              }}
            >
              ➕
            </span>

            <div
              style={{
                minWidth: 0
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  textTransform:
                    'uppercase',

                  lineHeight:
                    1.2,

                  marginBottom:
                    '0.35rem'
                }}
              >
                Crear Producto
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  opacity: 0.9,
                  lineHeight: 1.4
                }}
              >
                Registrar nuevas prendas
                en el catálogo
              </div>
            </div>
          </button>


          {/* INVENTARIO */}

          <button
            type="button"
            onClick={() =>
              navigate('/inventario')
            }
            style={{
              ...estiloTarjeta,

              backgroundColor:
                '#09090b',

              border:
                '1px solid #27272a'
            }}
          >
            <span
              style={{
                fontSize: '1.8rem',
                lineHeight: 1
              }}
            >
              📦
            </span>

            <div
              style={{
                minWidth: 0
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  textTransform:
                    'uppercase',

                  lineHeight:
                    1.2,

                  marginBottom:
                    '0.35rem'
                }}
              >
                Gestionar Inventario
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#a1a1aa',
                  lineHeight: 1.4
                }}
              >
                Ver, editar prendas,
                modificar tallas y stock
              </div>
            </div>
          </button>


          {/* PEDIDOS */}

          <button
            type="button"
            onClick={() =>
              navigate(
                '/historial-pedidos?vista=admin'
              )
            }
            style={{
              ...estiloTarjeta,

              backgroundColor:
                '#18181b',

              border:
                '1px solid #27272a'
            }}
          >
            <span
              style={{
                fontSize: '1.8rem',
                lineHeight: 1
              }}
            >
              🧾
            </span>

            <div
              style={{
                minWidth: 0
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  textTransform:
                    'uppercase',

                  lineHeight:
                    1.2,

                  marginBottom:
                    '0.35rem'
                }}
              >
                Pedidos y Chat
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#a1a1aa',
                  lineHeight: 1.4
                }}
              >
                Revisar solicitudes del
                cliente, previsualización
                y mensajes
              </div>
            </div>
          </button>


          {/* GESTIÓN DE USUARIOS */}

          <button
            type="button"
            onClick={() =>
              navigate('/gestion-usuarios')
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                '#18181b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                '#09090b';
            }}
            style={{
              ...estiloTarjeta,

              backgroundColor:
                '#09090b',

              border:
                '1px solid #dc2626',

              transition:
                'background-color 0.2s'
            }}
          >
            <span
              style={{
                fontSize: '1.8rem',
                lineHeight: 1
              }}
            >
              👥
            </span>

            <div
              style={{
                minWidth: 0
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  textTransform:
                    'uppercase',

                  lineHeight:
                    1.2,

                  marginBottom:
                    '0.35rem'
                }}
              >
                Gestión de Usuarios
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#a1a1aa',
                  lineHeight: 1.4
                }}
              >
                Activar, inactivar y
                cambiar roles de usuarios
              </div>
            </div>
          </button>

        </div>


        {/* =================================================
            CENTRO DE REPORTES
        ================================================== */}

        <div
          style={{
            backgroundColor:
              '#09090b',

            border:
              '1px solid #27272a',

            borderRadius:
              '0.75rem',

            padding:
              '1.5rem',

            boxSizing:
              'border-box'
          }}
        >

          <div
            style={{
              display:
                'flex',

              justifyContent:
                'space-between',

              alignItems:
                'center',

              marginBottom:
                '1rem',

              gap:
                '1rem'
            }}
          >

            <div>
              <h3
                style={{
                  textTransform:
                    'uppercase',

                  fontSize:
                    '1.1rem',

                  fontWeight:
                    800,

                  margin:
                    0,

                  color:
                    '#ffffff'
                }}
              >
                📊 Centro de Reportes
              </h3>

              <p
                style={{
                  color:
                    '#a1a1aa',

                  fontSize:
                    '0.85rem',

                  margin:
                    '0.25rem 0 0 0'
                }}
              >
                Genera informes basados
                en el inventario real de
                la base de datos.
              </p>
            </div>

            {mensajeReporte && (
              <span
                style={{
                  color:
                    '#22c55e',

                  fontSize:
                    '0.85rem',

                  fontWeight:
                    'bold',

                  textAlign:
                    'right'
                }}
              >
                {mensajeReporte}
              </span>
            )}
          </div>


          {/* BOTONES DE REPORTES */}

          <div
            style={{
              display:
                'flex',

              gap:
                '1rem',

              flexWrap:
                'wrap',

              paddingTop:
                '0.5rem'
            }}
          >

            {/* INVENTARIO EXCEL */}

            <button
              type="button"
              onClick={() =>
                descargarReporte(
                  'Estado del Inventario'
                )
              }
              style={{
                backgroundColor:
                  '#18181b',

                border:
                  '1px solid #27272a',

                color:
                  '#ffffff',

                padding:
                  '0.75rem 1.25rem',

                borderRadius:
                  '0.5rem',

                cursor:
                  'pointer',

                fontWeight:
                  'bold',

                fontSize:
                  '0.85rem',

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '0.5rem',

                fontFamily:
                  'inherit'
              }}
            >
              📥 Estado del Inventario
              (Excel)
            </button>


            {/* STOCK CRÍTICO */}

            <button
              type="button"
              onClick={() =>
                descargarReporte(
                  'Alertas de Stock Crítico'
                )
              }
              style={{
                backgroundColor:
                  '#18181b',

                border:
                  '1px solid #27272a',

                color:
                  '#ef4444',

                padding:
                  '0.75rem 1.25rem',

                borderRadius:
                  '0.5rem',

                cursor:
                  'pointer',

                fontWeight:
                  'bold',

                fontSize:
                  '0.85rem',

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '0.5rem',

                fontFamily:
                  'inherit'
              }}
            >
              ⚠️ Alertas de Stock Crítico
            </button>


            {/* VENTAS PDF */}

            <button
              type="button"
              onClick={() =>
                descargarReporte(
                  'Reporte de Ventas'
                )
              }
              style={{
                backgroundColor:
                  '#18181b',

                border:
                  '1px solid #27272a',

                color:
                  '#60a5fa',

                padding:
                  '0.75rem 1.25rem',

                borderRadius:
                  '0.5rem',

                cursor:
                  'pointer',

                fontWeight:
                  'bold',

                fontSize:
                  '0.85rem',

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '0.5rem',

                fontFamily:
                  'inherit'
              }}
            >
              📄 Reporte de Ventas
              (PDF)
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

