package com.nowstyle.taller_calidad_backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.nowstyle.taller_calidad_backend.controller.ProductoController;
import com.nowstyle.taller_calidad_backend.model.Producto;
import com.nowstyle.taller_calidad_backend.repository.ProductoRepository;

class ProductoControllerTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoController productoController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void listarProductosDebeRetornarProductos() {
        Producto producto1 = new Producto();
        producto1.setNombre("Camiseta");

        Producto producto2 = new Producto();
        producto2.setNombre("Pantalon");

        when(productoRepository.findAll())
                .thenReturn(Arrays.asList(producto1, producto2));

        var resultado = productoController.listarProductos();

        assertEquals(2, resultado.size());
        assertEquals("Camiseta", resultado.get(0).getNombre());
        assertEquals("Pantalon", resultado.get(1).getNombre());

        verify(productoRepository).findAll();
    }

    @Test
    void guardarProductoDebeGuardarYRetornarProducto() {
        Producto producto = new Producto();
        producto.setNombre("Camiseta");
        producto.setPrecio(50000.0);

        when(productoRepository.save(producto))
                .thenReturn(producto);

        Producto resultado = productoController.guardarProducto(producto);

        assertNotNull(resultado);
        assertEquals("Camiseta", resultado.getNombre());
        assertEquals(50000.0, resultado.getPrecio());

        verify(productoRepository).save(producto);
    }

    @Test
    void eliminarProductoDebeEliminarPorId() {
        Long id = 1L;

        doNothing().when(productoRepository).deleteById(id);

        productoController.eliminarProducto(id);

        verify(productoRepository).deleteById(id);
    }

    @Test
    void actualizarProductoCuandoExiste() {
        Long id = 1L;

        Producto existente = new Producto();
        existente.setId(id);
        existente.setNombre("Camiseta vieja");

        Producto detalles = new Producto();
        detalles.setNombre("Camiseta nueva");
        detalles.setDescripcion("Nueva descripcion");
        detalles.setCategoria("Camisetas");
        detalles.setColor("Negro");
        detalles.setPrecio(60000.0);
        detalles.setTallasStock("S:5,M:4");
        detalles.setImagen("imagen");

        when(productoRepository.findById(id))
                .thenReturn(Optional.of(existente));

        when(productoRepository.save(existente))
                .thenReturn(existente);

        Producto resultado =
                productoController.actualizarProducto(id, detalles);

        assertEquals("Camiseta nueva", resultado.getNombre());
        assertEquals("Nueva descripcion", resultado.getDescripcion());
        assertEquals("Camisetas", resultado.getCategoria());
        assertEquals("Negro", resultado.getColor());
        assertEquals(60000.0, resultado.getPrecio());
        assertEquals("S:5,M:4", resultado.getTallasStock());
        assertEquals("imagen", resultado.getImagen());

        verify(productoRepository).findById(id);
        verify(productoRepository).save(existente);
    }

    @Test
    void actualizarProductoCuandoNoExiste() {
        Long id = 99L;

        Producto detalles = new Producto();
        detalles.setNombre("Producto nuevo");

        when(productoRepository.findById(id))
                .thenReturn(Optional.empty());

        when(productoRepository.save(detalles))
                .thenReturn(detalles);

        Producto resultado =
                productoController.actualizarProducto(id, detalles);

        assertEquals(id, resultado.getId());
        assertEquals("Producto nuevo", resultado.getNombre());

        verify(productoRepository).findById(id);
        verify(productoRepository).save(detalles);
    }
}