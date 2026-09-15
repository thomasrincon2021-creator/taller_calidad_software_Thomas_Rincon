package com.nowstyle.taller_calidad_backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.io.BufferedReader;
import java.io.StringReader;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.nowstyle.taller_calidad_backend.controller.PagoController;
import com.nowstyle.taller_calidad_backend.controller.PedidoController;
import com.nowstyle.taller_calidad_backend.controller.ProductoController;
import com.nowstyle.taller_calidad_backend.controller.UsuarioController;
import com.nowstyle.taller_calidad_backend.model.DetallePedido;
import com.nowstyle.taller_calidad_backend.model.MensajePedido;
import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.model.Producto;
import com.nowstyle.taller_calidad_backend.model.Usuario;
import com.nowstyle.taller_calidad_backend.repository.MensajePedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.PedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.ProductoRepository;
import com.nowstyle.taller_calidad_backend.repository.UsuarioRepository;
import com.nowstyle.taller_calidad_backend.service.EmailService;

@ExtendWith(MockitoExtension.class)
class ControllersTest {

    // =========================================================
    // PRODUCTO CONTROLLER
    // =========================================================

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoController productoController;

    // =========================================================
    // USUARIO CONTROLLER
    // =========================================================

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UsuarioController usuarioController;

    // =========================================================
    // PEDIDO CONTROLLER
    // =========================================================

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private MensajePedidoRepository mensajePedidoRepository;

    @InjectMocks
    private PedidoController pedidoController;

    // =========================================================
    // PAGO CONTROLLER
    // =========================================================

    @InjectMocks
    private PagoController pagoController;

    @BeforeEach
    void limpiarMocks() {
        clearInvocations(
            productoRepository,
            usuarioRepository,
            emailService,
            pedidoRepository,
            mensajePedidoRepository
        );
    }

    // =========================================================
    // PRODUCTO CONTROLLER
    // =========================================================

    @Test
    void listarProductos() {

        Producto p1 = new Producto();
        p1.setNombre("Camiseta");

        Producto p2 = new Producto();
        p2.setNombre("Pantalón");

        when(productoRepository.findAll())
                .thenReturn(Arrays.asList(p1, p2));

        List<Producto> resultado =
                productoController.listarProductos();

        assertEquals(2, resultado.size());
        assertEquals("Camiseta", resultado.get(0).getNombre());
        assertEquals("Pantalón", resultado.get(1).getNombre());

        verify(productoRepository).findAll();
    }

    @Test
    void guardarProducto() {

        Producto producto = new Producto();
        producto.setNombre("Camiseta");
        producto.setPrecio(50000.0);

        when(productoRepository.save(producto))
                .thenReturn(producto);

        Producto resultado =
                productoController.guardarProducto(producto);

        assertEquals("Camiseta", resultado.getNombre());
        assertEquals(50000.0, resultado.getPrecio());

        verify(productoRepository).save(producto);
    }

    @Test
    void eliminarProducto() {

        productoController.eliminarProducto(1L);

        verify(productoRepository).deleteById(1L);
    }

    @Test
    void actualizarProductoExistente() {

        Producto existente = new Producto();
        existente.setId(1L);
        existente.setNombre("Viejo");

        Producto detalles = new Producto();
        detalles.setNombre("Nuevo");
        detalles.setDescripcion("Descripcion");
        detalles.setCategoria("Camisetas");
        detalles.setColor("Negro");
        detalles.setPrecio(60000.0);
        detalles.setTallasStock("S:5,M:3");
        detalles.setImagen("imagen");

        when(productoRepository.findById(1L))
                .thenReturn(Optional.of(existente));

        when(productoRepository.save(existente))
                .thenReturn(existente);

        Producto resultado =
                productoController.actualizarProducto(1L, detalles);

        assertEquals("Nuevo", resultado.getNombre());
        assertEquals("Descripcion", resultado.getDescripcion());
        assertEquals("Camisetas", resultado.getCategoria());
        assertEquals("Negro", resultado.getColor());
        assertEquals(60000.0, resultado.getPrecio());
        assertEquals("S:5,M:3", resultado.getTallasStock());
        assertEquals("imagen", resultado.getImagen());
    }

    @Test
    void actualizarProductoNoExistente() {

        Producto detalles = new Producto();
        detalles.setNombre("Nuevo");

        when(productoRepository.findById(99L))
                .thenReturn(Optional.empty());

        when(productoRepository.save(detalles))
                .thenReturn(detalles);

        Producto resultado =
                productoController.actualizarProducto(99L, detalles);

        assertEquals(99L, resultado.getId());
        assertEquals("Nuevo", resultado.getNombre());
    }

    // =========================================================
    // USUARIO CONTROLLER
    // =========================================================

    @Test
    void obtenerTodosLosUsuarios() {

        Usuario usuario = new Usuario();
        usuario.setUsuario("Thomas");

        when(usuarioRepository.findAll())
                .thenReturn(List.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.obtenerTodosLosUsuarios();

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals(List.of(usuario), respuesta.getBody());
    }

    @Test
    void obtenerUsuarioPorIdExistente() {

        Usuario usuario = new Usuario();
        usuario.setUsuario("Thomas");

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.obtenerUsuarioPorId(1L);

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals(usuario, respuesta.getBody());
    }

    @Test
    void obtenerUsuarioPorIdNoExistente() {

        when(usuarioRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseEntity<?> respuesta =
                usuarioController.obtenerUsuarioPorId(99L);

        assertEquals(404, respuesta.getStatusCode().value());
    }

    @Test
    void registrarUsuarioValido() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "+57 3000000000",
                "12345678"
        );

        when(usuarioRepository.findByEmail("thomas@gmail.com"))
                .thenReturn(Optional.empty());

        doNothing()
                .when(emailService)
                .enviarCodigoRegistro("thomas@gmail.com");

        ResponseEntity<?> respuesta =
                usuarioController.registrarUsuario(usuario);

        assertEquals(200, respuesta.getStatusCode().value());

        verify(emailService)
                .enviarCodigoRegistro("thomas@gmail.com");
    }

    @Test
    void registrarUsuarioInvalido() {

        Usuario usuario = new Usuario();
        usuario.setUsuario("abc");

        ResponseEntity<?> respuesta =
                usuarioController.registrarUsuario(usuario);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void registrarCorreoNoGmail() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@hotmail.com",
                "+57 3000000000",
                "12345678"
        );

        ResponseEntity<?> respuesta =
                usuarioController.registrarUsuario(usuario);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void registrarTelefonoInvalido() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "3000000000",
                "12345678"
        );

        ResponseEntity<?> respuesta =
                usuarioController.registrarUsuario(usuario);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void registrarPasswordCorta() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "+57 3000000000",
                "123"
        );

        ResponseEntity<?> respuesta =
                usuarioController.registrarUsuario(usuario);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void registrarCorreoRepetido() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "+57 3000000000",
                "12345678"
        );

        when(usuarioRepository.findByEmail("thomas@gmail.com"))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.registrarUsuario(usuario);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void verificarRegistroCodigoCorrecto() {

        Map<String, Object> usuarioData =
                Map.of(
                    "usuario", "Thomas",
                    "telefono", "+57 3000000000",
                    "password", "12345678"
                );

        Map<String, Object> payload =
                Map.of(
                    "email", "thomas@gmail.com",
                    "codigo", "123456",
                    "usuarioData", usuarioData
                );

        when(emailService.validarCodigo(
                "thomas@gmail.com",
                "123456"
        )).thenReturn(true);

        Usuario guardado = new Usuario();
        guardado.setUsuario("Thomas");

        when(usuarioRepository.save(any(Usuario.class)))
                .thenReturn(guardado);

        ResponseEntity<?> respuesta =
                usuarioController.verificarYGuardar(payload);

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals(guardado, respuesta.getBody());
    }

    @Test
    void verificarRegistroCodigoIncorrecto() {

        Map<String, Object> payload =
                Map.of(
                    "email", "thomas@gmail.com",
                    "codigo", "999999",
                    "usuarioData", Map.of(
                        "usuario", "Thomas",
                        "telefono", "+57 3000000000",
                        "password", "12345678"
                    )
                );

        when(emailService.validarCodigo(
                "thomas@gmail.com",
                "999999"
        )).thenReturn(false);

        ResponseEntity<?> respuesta =
                usuarioController.verificarYGuardar(payload);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void loginPorCorreoCorrecto() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "+57 3000000000",
                "12345678"
        );

        when(usuarioRepository.findByEmail("thomas@gmail.com"))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.loginUsuario(usuario);

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals(usuario, respuesta.getBody());
    }

    @Test
    void loginPorUsuarioCorrecto() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "+57 3000000000",
                "12345678"
        );

        Usuario login = new Usuario();
        login.setEmail("Thomas");
        login.setPassword("12345678");

        when(usuarioRepository.findByEmail("Thomas"))
                .thenReturn(Optional.empty());

        when(usuarioRepository.findByNombreUsuario("Thomas"))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.loginUsuario(login);

        assertEquals(200, respuesta.getStatusCode().value());
    }

    @Test
    void loginCuentaInactiva() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "+57 3000000000",
                "12345678"
        );

        usuario.setActivo(false);

        when(usuarioRepository.findByEmail("thomas@gmail.com"))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.loginUsuario(usuario);

        assertEquals(403, respuesta.getStatusCode().value());
    }

    @Test
    void loginCredencialesIncorrectas() {

        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "+57 3000000000",
                "12345678"
        );

        Usuario login = new Usuario();
        login.setEmail("thomas@gmail.com");
        login.setPassword("incorrecta");

        when(usuarioRepository.findByEmail("thomas@gmail.com"))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.loginUsuario(login);

        assertEquals(401, respuesta.getStatusCode().value());
    }

    @Test
    void solicitarRecuperacionCorreoVacio() {

        ResponseEntity<?> respuesta =
                usuarioController.solicitarRecuperacion(
                    Map.of("email", "")
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void solicitarRecuperacionUsuarioNoExiste() {

        when(usuarioRepository.findByEmail("x@gmail.com"))
                .thenReturn(Optional.empty());

        ResponseEntity<?> respuesta =
                usuarioController.solicitarRecuperacion(
                    Map.of("email", "x@gmail.com")
                );

        assertEquals(404, respuesta.getStatusCode().value());
    }

    @Test
    void solicitarRecuperacionCorrecta() {

        Usuario usuario = new Usuario();
        usuario.setEmail("thomas@gmail.com");

        when(usuarioRepository.findByEmail("thomas@gmail.com"))
                .thenReturn(Optional.of(usuario));

        doNothing()
                .when(emailService)
                .enviarCodigoRecuperacion("thomas@gmail.com");

        ResponseEntity<?> respuesta =
                usuarioController.solicitarRecuperacion(
                    Map.of("email", "thomas@gmail.com")
                );

        assertEquals(200, respuesta.getStatusCode().value());
    }

    @Test
    void actualizarPasswordCorta() {

        ResponseEntity<?> respuesta =
                usuarioController.actualizarPassword(
                    Map.of(
                        "email", "thomas@gmail.com",
                        "codigo", "123456",
                        "nuevaPassword", "123"
                    )
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void actualizarPasswordCodigoIncorrecto() {

        when(emailService.validarCodigo(
                "thomas@gmail.com",
                "123456"
        )).thenReturn(false);

        ResponseEntity<?> respuesta =
                usuarioController.actualizarPassword(
                    Map.of(
                        "email", "thomas@gmail.com",
                        "codigo", "123456",
                        "nuevaPassword", "12345678"
                    )
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void actualizarPasswordCorrecta() {

        Usuario usuario = new Usuario();
        usuario.setEmail("thomas@gmail.com");

        when(emailService.validarCodigo(
                "thomas@gmail.com",
                "123456"
        )).thenReturn(true);

        when(usuarioRepository.findByEmail("thomas@gmail.com"))
                .thenReturn(Optional.of(usuario));

        when(usuarioRepository.save(usuario))
                .thenReturn(usuario);

        ResponseEntity<?> respuesta =
                usuarioController.actualizarPassword(
                    Map.of(
                        "email", "thomas@gmail.com",
                        "codigo", "123456",
                        "nuevaPassword", "abcdefgh"
                    )
                );

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals("abcdefgh", usuario.getPassword());
    }

    @Test
    void actualizarPerfilUsuarioNoExiste() {

        when(usuarioRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseEntity<?> respuesta =
                usuarioController.actualizarPerfil(
                    99L,
                    new Usuario()
                );

        assertEquals(404, respuesta.getStatusCode().value());
    }

    @Test
    void actualizarPerfilCorrecto() {

        Usuario usuario = new Usuario();
        usuario.setUsuario("Thomas");
        usuario.setEmail("old@gmail.com");

        Usuario datos = new Usuario();
        datos.setUsuario("ThomasNuevo");
        datos.setEmail("new@gmail.com");
        datos.setTelefono("+57 3000000000");
        datos.setFoto("foto");

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        when(usuarioRepository.save(usuario))
                .thenReturn(usuario);

        ResponseEntity<?> respuesta =
                usuarioController.actualizarPerfil(
                    1L,
                    datos
                );

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals("ThomasNuevo", usuario.getUsuario());
        assertEquals("new@gmail.com", usuario.getEmail());
        assertEquals("+57 3000000000", usuario.getTelefono());
        assertEquals("foto", usuario.getFoto());
    }

    @Test
    void cambiarEstadoNoExiste() {

        when(usuarioRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseEntity<?> respuesta =
                usuarioController.cambiarEstadoUsuario(
                    99L,
                    Map.of("activo", true)
                );

        assertEquals(404, respuesta.getStatusCode().value());
    }

    @Test
    void cambiarEstadoSinDato() {

        Usuario usuario = new Usuario();

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.cambiarEstadoUsuario(
                    1L,
                    Collections.emptyMap()
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void cambiarEstadoCorrecto() {

        Usuario usuario = new Usuario();

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        when(usuarioRepository.save(usuario))
                .thenReturn(usuario);

        ResponseEntity<?> respuesta =
                usuarioController.cambiarEstadoUsuario(
                    1L,
                    Map.of("activo", false)
                );

        assertEquals(200, respuesta.getStatusCode().value());
        assertFalse(usuario.getActivo());
    }

    @Test
    void cambiarRolNoExiste() {

        when(usuarioRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseEntity<?> respuesta =
                usuarioController.cambiarRolUsuario(
                    99L,
                    Map.of("rol", "CLIENTE")
                );

        assertEquals(404, respuesta.getStatusCode().value());
    }

    @Test
    void cambiarRolSinDato() {

        Usuario usuario = new Usuario();

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.cambiarRolUsuario(
                    1L,
                    Collections.emptyMap()
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void cambiarRolInvalido() {

        Usuario usuario = new Usuario();

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        ResponseEntity<?> respuesta =
                usuarioController.cambiarRolUsuario(
                    1L,
                    Map.of("rol", "GERENTE")
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void cambiarRolCorrecto() {

        Usuario usuario = new Usuario();

        when(usuarioRepository.findById(1L))
                .thenReturn(Optional.of(usuario));

        when(usuarioRepository.save(usuario))
                .thenReturn(usuario);

        ResponseEntity<?> respuesta =
                usuarioController.cambiarRolUsuario(
                    1L,
                    Map.of("rol", "empleado")
                );

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals("EMPLEADO", usuario.getRol());
    }

    // =========================================================
    // PEDIDO CONTROLLER
    // =========================================================

    @Test
    void obtenerTodosLosPedidos() {

        Pedido pedido = new Pedido();

        when(pedidoRepository.findAllWithItems())
                .thenReturn(List.of(pedido));

        ResponseEntity<List<Pedido>> respuesta =
                pedidoController.obtenerTodosLosPedidos();

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals(1, respuesta.getBody().size());
    }

    @Test
    void obtenerPedidosPorUsuario() {

        Pedido pedido = new Pedido();

        when(pedidoRepository.findByUsuarioEmailWithItems(
                "thomas@gmail.com"
        )).thenReturn(List.of(pedido));

        ResponseEntity<List<Pedido>> respuesta =
                pedidoController.obtenerPedidosPorUsuario(
                    "thomas@gmail.com"
                );

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals(1, respuesta.getBody().size());
    }

    @Test
    void obtenerMensajesLimpiaTextoDeImagen() {

        MensajePedido mensaje = new MensajePedido();
        mensaje.setImagen("imagen-base64");
        mensaje.setMensaje("Imagen adjunta");

        when(mensajePedidoRepository
                .findByPedidoIdOrderByFechaAsc(1L))
                .thenReturn(List.of(mensaje));

        ResponseEntity<List<MensajePedido>> respuesta =
                pedidoController.obtenerMensajes(1L);

        assertEquals(200, respuesta.getStatusCode().value());
        assertNull(respuesta.getBody().get(0).getMensaje());
    }

    @Test
    void obtenerMensajesConTextoNormal() {

        MensajePedido mensaje = new MensajePedido();
        mensaje.setMensaje("Hola");
        mensaje.setImagen(null);

        when(mensajePedidoRepository
                .findByPedidoIdOrderByFechaAsc(1L))
                .thenReturn(List.of(mensaje));

        ResponseEntity<List<MensajePedido>> respuesta =
                pedidoController.obtenerMensajes(1L);

        assertEquals("Hola", respuesta.getBody().get(0).getMensaje());
    }

    @Test
    void enviarMensajeCuerpoVacio() throws Exception {

        HttpServletRequest request =
                mock(HttpServletRequest.class);

        when(request.getReader())
                .thenReturn(
                    new BufferedReader(
                        new StringReader("")
                    )
                );

        ResponseEntity<?> respuesta =
                pedidoController.enviarMensaje(
                    1L,
                    request
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void enviarMensajeValido() throws Exception {

        HttpServletRequest request =
                mock(HttpServletRequest.class);

        String json =
                """
                {
                    "mensaje": "Hola",
                    "autorEmail": "cliente@gmail.com",
                    "rolAutor": "CLIENTE"
                }
                """;

        when(request.getReader())
                .thenReturn(
                    new BufferedReader(
                        new StringReader(json)
                    )
                );

        when(pedidoRepository.existsById(1L))
                .thenReturn(true);

        MensajePedido guardado =
                new MensajePedido();

        guardado.setMensaje("Hola");

        when(mensajePedidoRepository.save(
                any(MensajePedido.class)
        )).thenReturn(guardado);

        ResponseEntity<?> respuesta =
                pedidoController.enviarMensaje(
                    1L,
                    request
                );

        assertEquals(200, respuesta.getStatusCode().value());
    }

    @Test
    void enviarMensajeSinTextoNiImagen() throws Exception {

        HttpServletRequest request =
                mock(HttpServletRequest.class);

        String json = """
        {
            "mensaje": "",
            "autorEmail": "cliente@gmail.com"
        }
        """;

        when(request.getReader())
                .thenReturn(
                    new BufferedReader(
                        new StringReader(json)
                    )
                );

        ResponseEntity<?> respuesta =
                pedidoController.enviarMensaje(
                    1L,
                    request
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void enviarMensajePedidoNoExiste() throws Exception {

        HttpServletRequest request =
                mock(HttpServletRequest.class);

        String json = """
        {
            "mensaje": "Hola"
        }
        """;

        when(request.getReader())
                .thenReturn(
                    new BufferedReader(
                        new StringReader(json)
                    )
                );

        when(pedidoRepository.existsById(1L))
                .thenReturn(false);

        ResponseEntity<?> respuesta =
                pedidoController.enviarMensaje(
                    1L,
                    request
                );

        assertEquals(404, respuesta.getStatusCode().value());
    }

    @Test
    void enviarMensajeJsonInvalido() throws Exception {

        HttpServletRequest request =
                mock(HttpServletRequest.class);

        when(request.getReader())
                .thenReturn(
                    new BufferedReader(
                        new StringReader("{mal json"))
                );

        ResponseEntity<?> respuesta =
                pedidoController.enviarMensaje(
                    1L,
                    request
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void actualizarEstadoPedidoNoExiste() {

        when(pedidoRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseEntity<?> respuesta =
                pedidoController.actualizarEstado(
                    99L,
                    Map.of("estado", "pagado")
                );

        assertEquals(404, respuesta.getStatusCode().value());
    }

    @Test
    void actualizarEstadoSinDato() {

        Pedido pedido = new Pedido();

        when(pedidoRepository.findById(1L))
                .thenReturn(Optional.of(pedido));

        ResponseEntity<?> respuesta =
                pedidoController.actualizarEstado(
                    1L,
                    Collections.emptyMap()
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void actualizarEstadoCorrecto() {

        Pedido pedido = new Pedido();

        when(pedidoRepository.findById(1L))
                .thenReturn(Optional.of(pedido));

        when(pedidoRepository.save(pedido))
                .thenReturn(pedido);

        ResponseEntity<?> respuesta =
                pedidoController.actualizarEstado(
                    1L,
                    Map.of("estado", "pagado")
                );

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals("PAGADO", pedido.getEstado());
    }

    // =========================================================
    // PAGO CONTROLLER
    // =========================================================

    @Test
    void crearPreferenciaCarritoVacio() {

        ResponseEntity<?> respuesta =
                pagoController.crearPreferencia(
                    Collections.emptyMap()
                );

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void crearPreferenciaProductoNoExiste() {

        Map<String, Object> item =
                Map.of(
                    "productoId", 99L,
                    "cantidad", 1,
                    "talla", "M"
                );

        Map<String, Object> orden =
                Map.of(
                    "items", List.of(item),
                    "usuarioEmail", "cliente@gmail.com"
                );

        when(usuarioRepository.findByEmail(
                "cliente@gmail.com"
        )).thenReturn(Optional.empty());

        when(productoRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseEntity<?> respuesta =
                pagoController.crearPreferencia(orden);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void crearPreferenciaStockInsuficiente() {

        Producto producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Camiseta");
        producto.setTallasStock("M:1");

        Map<String, Object> item =
                Map.of(
                    "productoId", 1L,
                    "cantidad", 5,
                    "talla", "M"
                );

        Map<String, Object> orden =
                Map.of(
                    "items", List.of(item),
                    "usuarioEmail", "cliente@gmail.com",
                    "subtotal", 50000.0,
                    "descuento", 0.0,
                    "costoEnvio", 6000.0,
                    "total", 56000.0
                );

        when(usuarioRepository.findByEmail(
                "cliente@gmail.com"
        )).thenReturn(Optional.empty());

        when(productoRepository.findById(1L))
                .thenReturn(Optional.of(producto));

        ResponseEntity<?> respuesta =
                pagoController.crearPreferencia(orden);

        assertEquals(400, respuesta.getStatusCode().value());
    }

    @Test
    void crearPreferenciaCorrecta() {

        Producto producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Camiseta");
        producto.setTallasStock("M:5");

        Map<String, Object> item =
                Map.of(
                    "productoId", 1L,
                    "cantidad", 1,
                    "talla", "M",
                    "nombre", "Camiseta",
                    "precioUnitario", 50000.0,
                    "categoria", "Camisetas"
                );

        Map<String, Object> orden =
                Map.of(
                    "items", List.of(item),
                    "usuarioEmail", "cliente@gmail.com",
                    "direccionEnvio", "Calle 10",
                    "ciudadEnvio", "Bogotá",
                    "cupon", "",
                    "mensajePedido", "",
                    "subtotal", 50000.0,
                    "descuento", 0.0,
                    "costoEnvio", 6000.0,
                    "total", 56000.0
                );

        when(usuarioRepository.findByEmail(
                "cliente@gmail.com"
        )).thenReturn(Optional.empty());

        when(productoRepository.findById(1L))
                .thenReturn(Optional.of(producto));

        when(productoRepository.save(producto))
                .thenReturn(producto);

        Pedido pedido = new Pedido();
        pedido.setId(10L);

        when(pedidoRepository.save(
                any(Pedido.class)
        )).thenReturn(pedido);

        when(mensajePedidoRepository.save(
                any(MensajePedido.class)
        )).thenAnswer(
            invocation -> invocation.getArgument(0)
        );

        ResponseEntity<?> respuesta =
                pagoController.crearPreferencia(orden);

        assertEquals(200, respuesta.getStatusCode().value());
        assertEquals("M:4", producto.getTallasStock());

        verify(productoRepository)
                .save(producto);

        verify(pedidoRepository, atLeastOnce())
                .save(any(Pedido.class));

        verify(mensajePedidoRepository, atLeastOnce())
                .save(any(MensajePedido.class));
    }

    @Test
    void crearPreferenciaConCuponPrimeraCompra() {

        Producto producto = new Producto();
        producto.setId(2L);
        producto.setNombre("Pantalón");
        producto.setTallasStock("M:5");

        Usuario usuario = new Usuario();
        usuario.setEmail("cliente@gmail.com");
        usuario.setCuponPrimeraCompra(true);

        Map<String, Object> item =
                Map.of(
                    "productoId", 2L,
                    "cantidad", 1,
                    "talla", "M",
                    "nombre", "Pantalón",
                    "precioUnitario", 100000.0
                );

        Map<String, Object> orden =
                Map.of(
                    "items", List.of(item),
                    "usuarioEmail", "cliente@gmail.com",
                    "cupon", "NOW20",
                    "subtotal", 100000.0,
                    "descuento", 0.0,
                    "costoEnvio", 6000.0,
                    "total", 106000.0
                );

        when(usuarioRepository.findByEmail(
                "cliente@gmail.com"
        )).thenReturn(Optional.of(usuario));

        when(productoRepository.findById(2L))
                .thenReturn(Optional.of(producto));

        when(productoRepository.save(producto))
                .thenReturn(producto);

        Pedido pedido = new Pedido();
        pedido.setId(20L);

        when(pedidoRepository.save(
                any(Pedido.class)
        )).thenReturn(pedido);

        when(mensajePedidoRepository.save(
                any(MensajePedido.class)
        )).thenAnswer(
            invocation -> invocation.getArgument(0)
        );

        ResponseEntity<?> respuesta =
                pagoController.crearPreferencia(orden);

        assertEquals(200, respuesta.getStatusCode().value());
        assertFalse(usuario.getCuponPrimeraCompra());

        verify(usuarioRepository)
                .save(usuario);
    }
}