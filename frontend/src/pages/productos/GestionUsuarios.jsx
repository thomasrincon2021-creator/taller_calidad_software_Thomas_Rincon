import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GestionUsuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [modalRol, setModalRol] = useState(null);
  const [modalEstado, setModalEstado] = useState(null);

  // =========================================================
  // CARGAR USUARIOS
  // =========================================================

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:8080/api/usuarios'
      );

      if (!response.ok) {
        throw new Error(
          'No se pudieron cargar los usuarios.'
        );
      }

      const data = await response.json();

      setUsuarios(data || []);

    } catch (err) {
      console.error(
        'Error al cargar usuarios:',
        err
      );

      setError(
        err.message ||
        'No se pudieron cargar los usuarios.'
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const obtenerNombre = (usuario) => {
    return (
      usuario.usuario ||
      usuario.nombre ||
      usuario.nombres ||
      usuario.username ||
      'Usuario'
    );
  };

  const obtenerEmail = (usuario) => {
    return (
      usuario.email ||
      usuario.correo ||
      usuario.usuarioEmail ||
      'Sin correo'
    );
  };

  const obtenerRol = (usuario) => {
    return (
      usuario.rol ||
      usuario.role ||
      'CLIENTE'
    ).toUpperCase();
  };

  const usuarioEstaActivo = (usuario) => {
    return usuario.activo !== false;
  };

  // =========================================================
  // SOLICITAR CAMBIO DE ROL
  // =========================================================

  const cambiarRol = (usuario, nuevoRol) => {
    const rolActual = obtenerRol(usuario);

    // El ADMIN está protegido
    if (rolActual === 'ADMIN') {
      setError(
        'El administrador principal no puede cambiar su rol.'
      );

      setTimeout(() => {
        setError('');
      }, 3000);

      return;
    }

    // Solo CLIENTE y EMPLEADO
    if (
      nuevoRol !== 'CLIENTE' &&
      nuevoRol !== 'EMPLEADO'
    ) {
      return;
    }

    // Si selecciona el mismo rol, no hacemos nada
    if (nuevoRol === rolActual) {
      return;
    }

    // Abrir modal personalizado
    setModalRol({
      usuario,
      nuevoRol
    });
  };

  // =========================================================
  // CONFIRMAR CAMBIO DE ROL
  // =========================================================

  const confirmarCambioRol = async () => {
    if (!modalRol) {
      return;
    }

    const {
      usuario,
      nuevoRol
    } = modalRol;

    try {
      const response = await fetch(
        `http://localhost:8080/api/usuarios/${usuario.id}/rol`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            rol: nuevoRol
          })
        }
      );

      if (!response.ok) {
        let mensajeBackend =
          'No se pudo cambiar el rol del usuario.';

        try {
          const texto =
            await response.text();

          if (texto) {
            mensajeBackend = texto;
          }
        } catch {
          // No hacer nada
        }

        throw new Error(mensajeBackend);
      }

      setModalRol(null);

      setMensaje(
        `Rol de ${obtenerNombre(usuario)} actualizado a ${nuevoRol}.`
      );

      await cargarUsuarios();

      setTimeout(() => {
        setMensaje('');
      }, 3000);

    } catch (err) {
      console.error(
        'Error al cambiar rol:',
        err
      );

      setModalRol(null);

      setError(
        err.message ||
        'No se pudo cambiar el rol.'
      );

      setTimeout(() => {
        setError('');
      }, 4000);
    }
  };

  // =========================================================
  // SOLICITAR CAMBIO DE ESTADO
  // =========================================================

  const cambiarEstado = (usuario) => {
    const estaActivo =
      usuarioEstaActivo(usuario);

    const nuevoEstado =
      !estaActivo;

    // Abrir modal personalizado
    setModalEstado({
      usuario,
      nuevoEstado
    });
  };

  // =========================================================
  // CONFIRMAR CAMBIO DE ESTADO
  // =========================================================

  const confirmarCambioEstado = async () => {
    if (!modalEstado) {
      return;
    }

    const {
      usuario,
      nuevoEstado
    } = modalEstado;

    try {
      const response = await fetch(
        `http://localhost:8080/api/usuarios/${usuario.id}/estado`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            activo: nuevoEstado
          })
        }
      );

      if (!response.ok) {
        let mensajeBackend =
          'No se pudo actualizar el estado del usuario.';

        try {
          const texto =
            await response.text();

          if (texto) {
            mensajeBackend = texto;
          }
        } catch {
          // No hacer nada
        }

        throw new Error(mensajeBackend);
      }

      setModalEstado(null);

      setMensaje(
        nuevoEstado
          ? `${obtenerNombre(usuario)} fue activado correctamente.`
          : `${obtenerNombre(usuario)} fue inactivado correctamente.`
      );

      await cargarUsuarios();

      setTimeout(() => {
        setMensaje('');
      }, 3000);

    } catch (err) {
      console.error(
        'Error al cambiar estado:',
        err
      );

      setModalEstado(null);

      setError(
        err.message ||
        'No se pudo actualizar el estado.'
      );

      setTimeout(() => {
        setError('');
      }, 4000);
    }
  };

  // =========================================================
  // INTERFAZ
  // =========================================================

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
        style={{
          backgroundColor: '#09090b',
          borderBottom: '1px solid #27272a',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >

        <div
          style={{
            fontWeight: 900,
            fontSize: '1.4rem'
          }}
        >
          Now
          <span
            style={{
              color: '#dc2626'
            }}
          >
            Style
          </span>{' '}
          ADMIN
        </div>

        <button
          onClick={() =>
            navigate('/panel')
          }
          style={{
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            color: '#ffffff',
            padding: '0.6rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Panel de Control
        </button>

      </nav>


      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div
        style={{
          maxWidth: '1200px',
          margin: '2rem auto',
          padding: '0 1.5rem'
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
            Gestión de{' '}
            <span
              style={{
                color: '#dc2626'
              }}
            >
              Usuarios
            </span>
          </h1>

          <p
            style={{
              color: '#a1a1aa',
              marginTop: '0.5rem'
            }}
          >
            Administra los usuarios registrados,
            sus roles y su estado.
          </p>

        </div>


        {/* MENSAJE */}

        {mensaje && (
          <div
            style={{
              backgroundColor: '#052e16',
              border: '1px solid #166534',
              color: '#4ade80',
              padding: '0.9rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}
          >
            ✅ {mensaje}
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div
            style={{
              backgroundColor: '#450a0a',
              border: '1px solid #991b1b',
              color: '#f87171',
              padding: '0.9rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}
          >
            ❌ {error}
          </div>
        )}


        {/* =================================================
            TABLA
        ================================================== */}

        <div
          style={{
            backgroundColor: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}
        >

          {/* CABECERA */}

          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #27272a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  textTransform: 'uppercase'
                }}
              >
                👥 Usuarios registrados
              </h2>

              <p
                style={{
                  margin: '0.3rem 0 0',
                  color: '#71717a',
                  fontSize: '0.8rem'
                }}
              >
                Total: {usuarios.length}
              </p>

            </div>


            <button
              onClick={cargarUsuarios}
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                color: '#ffffff',
                padding: '0.55rem 0.9rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Actualizar
            </button>

          </div>


          {/* LOADING */}

          {loading ? (

            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#a1a1aa'
              }}
            >
              Cargando usuarios...
            </div>

          ) : usuarios.length === 0 ? (

            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#a1a1aa'
              }}
            >
              No hay usuarios registrados.
            </div>

          ) : (

            <div
              style={{
                overflowX: 'auto'
              }}
            >

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}
              >

                <thead>

                  <tr
                    style={{
                      backgroundColor: '#18181b'
                    }}
                  >

                    <th style={estiloCabecera}>
                      ID
                    </th>

                    <th style={estiloCabecera}>
                      Usuario
                    </th>

                    <th style={estiloCabecera}>
                      Correo
                    </th>

                    <th style={estiloCabecera}>
                      Rol
                    </th>

                    <th style={estiloCabecera}>
                      Estado
                    </th>

                    <th style={estiloCabecera}>
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {usuarios.map(
                    (usuario, index) => {

                      const rol =
                        obtenerRol(usuario);

                      const activo =
                        usuarioEstaActivo(usuario);

                      const esAdmin =
                        rol === 'ADMIN';

                      return (

                        <tr
                          key={
                            usuario.id ||
                            index
                          }
                          style={{
                            borderTop:
                              '1px solid #27272a'
                          }}
                        >

                          {/* ID */}

                          <td style={estiloCelda}>
                            {usuario.id || '-'}
                          </td>


                          {/* USUARIO */}

                          <td style={estiloCelda}>

                            <div
                              style={{
                                fontWeight: 700
                              }}
                            >
                              {obtenerNombre(
                                usuario
                              )}
                            </div>

                          </td>


                          {/* EMAIL */}

                          <td style={estiloCelda}>
                            {obtenerEmail(
                              usuario
                            )}
                          </td>


                          {/* ROL */}

                          <td style={estiloCelda}>

                            {esAdmin ? (

                              <div>

                                <span
                                  style={{
                                    display:
                                      'inline-block',

                                    padding:
                                      '0.35rem 0.65rem',

                                    borderRadius:
                                      '999px',

                                    backgroundColor:
                                      '#450a0a',

                                    color:
                                      '#f87171',

                                    fontSize:
                                      '0.75rem',

                                    fontWeight:
                                      'bold'
                                  }}
                                >
                                  🔒 ADMIN
                                </span>

                                <div
                                  style={{
                                    marginTop:
                                      '0.35rem',

                                    color:
                                      '#71717a',

                                    fontSize:
                                      '0.7rem'
                                  }}
                                >
                                  Administrador principal
                                </div>

                              </div>

                            ) : (

                              <select
                                value={rol}
                                onChange={(e) =>
                                  cambiarRol(
                                    usuario,
                                    e.target.value
                                  )
                                }
                                style={{
                                  backgroundColor:
                                    '#18181b',

                                  border:
                                    '1px solid #3f3f46',

                                  color:
                                    '#ffffff',

                                  padding:
                                    '0.45rem 0.65rem',

                                  borderRadius:
                                    '0.4rem',

                                  cursor:
                                    'pointer',

                                  fontSize:
                                    '0.8rem',

                                  fontWeight:
                                    'bold'
                                }}
                              >

                                <option value="CLIENTE">
                                  CLIENTE
                                </option>

                                <option value="EMPLEADO">
                                  EMPLEADO
                                </option>

                              </select>

                            )}

                          </td>


                          {/* ESTADO */}

                          <td style={estiloCelda}>

                            <span
                              style={{
                                display:
                                  'inline-block',

                                padding:
                                  '0.35rem 0.65rem',

                                borderRadius:
                                  '999px',

                                backgroundColor:
                                  activo
                                    ? '#052e16'
                                    : '#27272a',

                                color:
                                  activo
                                    ? '#4ade80'
                                    : '#a1a1aa',

                                fontSize:
                                  '0.75rem',

                                fontWeight:
                                  'bold'
                              }}
                            >
                              {activo
                                ? 'ACTIVO'
                                : 'INACTIVO'}
                            </span>

                          </td>


                          {/* ACCIONES */}

                          <td style={estiloCelda}>

                            <div
                              style={{
                                display:
                                  'flex',

                                gap:
                                  '0.5rem',

                                flexWrap:
                                  'wrap'
                              }}
                            >

                              {esAdmin ? (

                                <span
                                  style={{
                                    backgroundColor:
                                      '#18181b',

                                    border:
                                      '1px solid #3f3f46',

                                    color:
                                      '#71717a',

                                    padding:
                                      '0.45rem 0.7rem',

                                    borderRadius:
                                      '0.4rem',

                                    fontSize:
                                      '0.75rem',

                                    fontWeight:
                                      'bold'
                                  }}
                                >
                                  🔒 Cuenta protegida
                                </span>

                              ) : (

                                <button
                                  onClick={() =>
                                    cambiarEstado(
                                      usuario
                                    )
                                  }
                                  style={{
                                    backgroundColor:
                                      activo
                                        ? '#450a0a'
                                        : '#052e16',

                                    border:
                                      activo
                                        ? '1px solid #991b1b'
                                        : '1px solid #166534',

                                    color:
                                      activo
                                        ? '#f87171'
                                        : '#4ade80',

                                    padding:
                                      '0.45rem 0.7rem',

                                    borderRadius:
                                      '0.4rem',

                                    cursor:
                                      'pointer',

                                    fontSize:
                                      '0.75rem',

                                    fontWeight:
                                      'bold'
                                  }}
                                >
                                  {activo
                                    ? '🚫 Inactivar'
                                    : '✅ Activar'}
                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          MODAL CAMBIO DE ROL
      ====================================================== */}

      {modalRol && (

        <div
          style={estiloOverlay}
          onClick={() =>
            setModalRol(null)
          }
        >

          <div
            style={estiloModal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div
              style={{
                fontSize: '2rem',
                marginBottom: '0.7rem'
              }}
            >
              🔐
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '1.3rem'
              }}
            >
              Cambiar rol
            </h2>

            <p
              style={{
                color: '#a1a1aa',
                lineHeight: 1.5,
                marginTop: '0.7rem'
              }}
            >
              Vas a cambiar el rol de{' '}
              <strong
                style={{
                  color: '#ffffff'
                }}
              >
                {obtenerNombre(
                  modalRol.usuario
                )}
              </strong>
              .
            </p>

            <div
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1rem 0'
              }}
            >

              <div
                style={{
                  color: '#71717a',
                  fontSize: '0.7rem',
                  marginBottom: '0.3rem'
                }}
              >
                NUEVO ROL
              </div>

              <div
                style={{
                  color:
                    modalRol.nuevoRol === 'EMPLEADO'
                      ? '#60a5fa'
                      : '#4ade80',

                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}
              >
                {modalRol.nuevoRol}
              </div>

            </div>

            <p
              style={{
                color: '#71717a',
                fontSize: '0.8rem'
              }}
            >
              Esta acción modificará los permisos
              del usuario.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.7rem',
                marginTop: '1.5rem'
              }}
            >

              <button
                onClick={() =>
                  setModalRol(null)
                }
                style={botonCancelar}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarCambioRol}
                style={botonConfirmar}
              >
                Confirmar cambio
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          MODAL CAMBIO DE ESTADO
      ====================================================== */}

      {modalEstado && (

        <div
          style={estiloOverlay}
          onClick={() =>
            setModalEstado(null)
          }
        >

          <div
            style={estiloModal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div
              style={{
                fontSize: '2rem',
                marginBottom: '0.7rem'
              }}
            >
              {modalEstado.nuevoEstado
                ? '✅'
                : '🚫'}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '1.3rem'
              }}
            >
              {modalEstado.nuevoEstado
                ? 'Activar usuario'
                : 'Inactivar usuario'}
            </h2>

            <p
              style={{
                color: '#a1a1aa',
                lineHeight: 1.5,
                marginTop: '0.7rem'
              }}
            >
              ¿Quieres{' '}
              {modalEstado.nuevoEstado
                ? 'activar'
                : 'inactivar'}{' '}
              a{' '}
              <strong
                style={{
                  color: '#ffffff'
                }}
              >
                {obtenerNombre(
                  modalEstado.usuario
                )}
              </strong>
              ?
            </p>

            <div
              style={{
                backgroundColor:
                  modalEstado.nuevoEstado
                    ? '#052e16'
                    : '#450a0a',

                border:
                  modalEstado.nuevoEstado
                    ? '1px solid #166534'
                    : '1px solid #991b1b',

                color:
                  modalEstado.nuevoEstado
                    ? '#4ade80'
                    : '#f87171',

                borderRadius: '8px',
                padding: '1rem',
                margin: '1rem 0',
                fontWeight: 'bold'
              }}
            >
              {modalEstado.nuevoEstado
                ? 'El usuario podrá iniciar sesión nuevamente.'
                : 'El usuario no podrá iniciar sesión mientras esté inactivo.'}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.7rem',
                marginTop: '1.5rem'
              }}
            >

              <button
                onClick={() =>
                  setModalEstado(null)
                }
                style={botonCancelar}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarCambioEstado}
                style={
                  modalEstado.nuevoEstado
                    ? botonActivar
                    : botonInactivar
                }
              >
                {modalEstado.nuevoEstado
                  ? 'Activar usuario'
                  : 'Inactivar usuario'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// =========================================================
// ESTILOS
// =========================================================

const estiloCabecera = {
  padding: '1rem',
  textAlign: 'left',
  color: '#a1a1aa',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  fontWeight: 'bold'
};

const estiloCelda = {
  padding: '1rem',
  color: '#e4e4e7',
  fontSize: '0.85rem'
};

const estiloOverlay = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.78)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(5px)'
};

const estiloModal = {
  width: 'min(430px, 90%)',
  backgroundColor: '#09090b',
  border: '1px solid #3f3f46',
  borderRadius: '14px',
  padding: '1.8rem',
  boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
};

const botonCancelar = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  color: '#ffffff',
  padding: '0.65rem 1rem',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const botonConfirmar = {
  backgroundColor: '#dc2626',
  border: '1px solid #ef4444',
  color: '#ffffff',
  padding: '0.65rem 1rem',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const botonInactivar = {
  backgroundColor: '#991b1b',
  border: '1px solid #dc2626',
  color: '#ffffff',
  padding: '0.65rem 1rem',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const botonActivar = {
  backgroundColor: '#166534',
  border: '1px solid #22c55e',
  color: '#ffffff',
  padding: '0.65rem 1rem',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: 'bold'
};