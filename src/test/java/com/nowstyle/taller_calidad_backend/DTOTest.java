package com.nowstyle.taller_calidad_backend;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.nowstyle.taller_calidad_backend.dto.CartItemDTO;
import com.nowstyle.taller_calidad_backend.dto.OrdenDTO;

class DTOTest {

    @Test
    void probarCartItemDTO() {
        CartItemDTO item = new CartItemDTO();

        item.setNombre("Camiseta");
        item.setTalla("M");
        item.setCantidad(2);
        item.setPrecio(45000.0);

        assertEquals("Camiseta", item.getNombre());
        assertEquals("M", item.getTalla());
        assertEquals(2, item.getCantidad());
        assertEquals(45000.0, item.getPrecio());
    }

    @Test
    void probarOrdenDTO() {
        OrdenDTO orden = new OrdenDTO();

        orden.setId("ORD-001");
        orden.setUsuarioEmail("cliente@gmail.com");
        orden.setDireccionEnvio("Calle 10 #20-30");
        orden.setCiudadEnvio("Bogotá");
        orden.setSubtotal(100000.0);
        orden.setDescuento(20000.0);
        orden.setCostoEnvio(6000.0);
        orden.setTotal(86000.0);
        orden.setCupon("NOW20");
        orden.setMensajePedido("Entregar en la tarde");

        List<OrdenDTO.ItemDTO> items = new ArrayList<>();
        orden.setItems(items);

        assertEquals("ORD-001", orden.getId());
        assertEquals("cliente@gmail.com", orden.getUsuarioEmail());
        assertEquals("Calle 10 #20-30", orden.getDireccionEnvio());
        assertEquals("Bogotá", orden.getCiudadEnvio());
        assertEquals(100000.0, orden.getSubtotal());
        assertEquals(20000.0, orden.getDescuento());
        assertEquals(6000.0, orden.getCostoEnvio());
        assertEquals(86000.0, orden.getTotal());
        assertEquals("NOW20", orden.getCupon());
        assertEquals("Entregar en la tarde", orden.getMensajePedido());
        assertSame(items, orden.getItems());
    }

    @Test
    void probarItemDeOrdenDTO() {
        OrdenDTO.ItemDTO item = new OrdenDTO.ItemDTO();

        item.setProductoId(25L);
        item.setNombre("Camiseta");
        item.setTitulo("Camiseta personalizada");
        item.setTalla("M");
        item.setCantidad(2);
        item.setPrecioUnitario(45000.0);
        item.setModelo3d("modelo.glb");
        item.setColorHex("#000000");
        item.setCategoria("Camisetas");
        item.setImagen("imagen-base64");
        item.setPersonalizacion("Frase personalizada");

        assertEquals(25L, item.getProductoId());
        assertEquals("Camiseta", item.getNombre());
        assertEquals("Camiseta personalizada", item.getTitulo());
        assertEquals("M", item.getTalla());
        assertEquals(2, item.getCantidad());
        assertEquals(45000.0, item.getPrecioUnitario());
        assertEquals("modelo.glb", item.getModelo3d());
        assertEquals("#000000", item.getColorHex());
        assertEquals("Camisetas", item.getCategoria());
        assertEquals("imagen-base64", item.getImagen());
        assertEquals("Frase personalizada", item.getPersonalizacion());
    }
}