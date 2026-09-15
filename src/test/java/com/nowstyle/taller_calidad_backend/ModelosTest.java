package com.nowstyle.taller_calidad_backend;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.junit.jupiter.api.Test;

import com.nowstyle.taller_calidad_backend.model.DetallePedido;
import com.nowstyle.taller_calidad_backend.model.MensajePedido;
import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.model.Producto;
import com.nowstyle.taller_calidad_backend.model.Usuario;

class ModelosTest {

    @Test
    void probarUsuario() {
        Usuario usuario = new Usuario(
                "Thomas",
                "thomas@gmail.com",
                "3001234567",
                "123456"
        );

        assertEquals("Thomas", usuario.getUsuario());
        assertEquals("thomas@gmail.com", usuario.getEmail());
        assertEquals("3001234567", usuario.getTelefono());
        assertEquals("123456", usuario.getPassword());
        assertEquals("CLIENTE", usuario.getRol());
        assertTrue(usuario.getActivo());

        usuario.setId(1L);
        usuario.setUsuario("Thomas2");
        usuario.setEmail("nuevo@gmail.com");
        usuario.setTelefono("3110000000");
        usuario.setPassword("abc123");
        usuario.setCuponPrimeraCompra(true);
        usuario.setRol("EMPLEADO");
        usuario.setActivo(false);
        usuario.setFoto("foto-base64");

        assertEquals(1L, usuario.getId());
        assertEquals("Thomas2", usuario.getUsuario());
        assertEquals("nuevo@gmail.com", usuario.getEmail());
        assertEquals("3110000000", usuario.getTelefono());
        assertEquals("abc123", usuario.getPassword());
        assertTrue(usuario.getCuponPrimeraCompra());
        assertEquals("EMPLEADO", usuario.getRol());
        assertFalse(usuario.getActivo());
        assertEquals("foto-base64", usuario.getFoto());
    }

    @Test
    void probarProducto() {
        Producto producto = new Producto();

        producto.setId(1L);
        producto.setNombre("Camiseta NowStyle");
        producto.setDescripcion("Camiseta personalizada");
        producto.setCategoria("Camisetas");
        producto.setColor("Negro");
        producto.setPrecio(59900.0);
        producto.setTallasStock("S:5,M:3,L:2");
        producto.setImagen("imagen-base64");

        assertEquals(1L, producto.getId());
        assertEquals("Camiseta NowStyle", producto.getNombre());
        assertEquals("Camiseta personalizada", producto.getDescripcion());
        assertEquals("Camisetas", producto.getCategoria());
        assertEquals("Negro", producto.getColor());
        assertEquals(59900.0, producto.getPrecio());
        assertEquals("S:5,M:3,L:2", producto.getTallasStock());
        assertEquals("imagen-base64", producto.getImagen());
    }

    @Test
    void probarPedido() {
        Pedido pedido = new Pedido();

        assertEquals("PENDIENTE", pedido.getEstado());
        assertNotNull(pedido.getFecha());
        assertNotNull(pedido.getItems());



        pedido.setId(10L);
        pedido.setUsuarioEmail("cliente@gmail.com");
        pedido.setDireccionEnvio("Calle 10 #20-30");
        pedido.setCiudadEnvio("Bogotá");
        pedido.setSubtotal(100000.0);
        pedido.setDescuento(20000.0);
        pedido.setCostoEnvio(6000.0);
        pedido.setTotal(86000.0);
        pedido.setEstado("PAGADO");
        pedido.setMercadoPagoId("MP123");
        pedido.setFecha(LocalDateTime.of(2026, 9, 14, 20, 0));

        ArrayList<DetallePedido> items = new ArrayList<>();
        pedido.setItems(items);

        assertEquals(10L, pedido.getId());
        assertEquals("cliente@gmail.com", pedido.getUsuarioEmail());
        assertEquals("Calle 10 #20-30", pedido.getDireccionEnvio());
        assertEquals("Bogotá", pedido.getCiudadEnvio());
        assertEquals(100000.0, pedido.getSubtotal());
        assertEquals(20000.0, pedido.getDescuento());
        assertEquals(6000.0, pedido.getCostoEnvio());
        assertEquals(86000.0, pedido.getTotal());
        assertEquals("PAGADO", pedido.getEstado());
        assertEquals("MP123", pedido.getMercadoPagoId());
        assertEquals(
                LocalDateTime.of(2026, 9, 14, 20, 0),
                pedido.getFecha()
        );
        assertSame(items, pedido.getItems());
    }

    @Test
    void probarDetallePedido() {
        DetallePedido detalle = new DetallePedido();

        detalle.setId(1L);
        detalle.setProductoId(25L);
        detalle.setNombre("Camiseta");
        detalle.setCantidad(2);
        detalle.setTalla("M");
        detalle.setPrecioUnitario(45000.0);
        detalle.setModelo3d("modelo.glb");
        detalle.setColorHex("#000000");
        detalle.setCategoria("Camisetas");
        detalle.setImagen("imagen-base64");
        detalle.setPersonalizacion("Frase personalizada");

        assertEquals(1L, detalle.getId());
        assertEquals(25L, detalle.getProductoId());
        assertEquals("Camiseta", detalle.getNombre());
        assertEquals(2, detalle.getCantidad());
        assertEquals("M", detalle.getTalla());
        assertEquals(45000.0, detalle.getPrecioUnitario());
        assertEquals("modelo.glb", detalle.getModelo3d());
        assertEquals("#000000", detalle.getColorHex());
        assertEquals("Camisetas", detalle.getCategoria());
        assertEquals("imagen-base64", detalle.getImagen());
        assertEquals("Frase personalizada", detalle.getPersonalizacion());
    }

    @Test
    void probarMensajePedido() {
        MensajePedido mensaje = new MensajePedido();

        assertNotNull(mensaje.getFecha());

        mensaje.setPedidoId(5L);
        mensaje.setAutorEmail("cliente@gmail.com");
        mensaje.setRolAutor("CLIENTE");
        mensaje.setMensaje("Hola, quiero información");
        mensaje.setImagen("imagen-base64");

        assertEquals(5L, mensaje.getPedidoId());
        assertEquals("cliente@gmail.com", mensaje.getAutorEmail());
        assertEquals("CLIENTE", mensaje.getRolAutor());
        assertEquals("Hola, quiero información", mensaje.getMensaje());
        assertEquals("imagen-base64", mensaje.getImagen());
        assertNotNull(mensaje.getFecha());
    }
}