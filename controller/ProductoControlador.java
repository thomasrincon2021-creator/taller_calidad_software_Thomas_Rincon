package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.modelo.Producto;
import com.nowstyle.taller_calidad_backend.repositorio.ProductoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoControlador {

    @Autowired
    private ProductoRepositorio productoRepositorio;

    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepositorio.findAll();
    }

    @PostMapping
    public Producto guardarProducto(@RequestBody Producto producto) {
        return productoRepositorio.save(producto);
    }

    // Método nuevo para actualizar productos (Editar del CRUD)
    @PutMapping("/{id}")
    public Producto actualizarProducto(@PathVariable Long id, @RequestBody Producto productoDetalles) {
        Producto producto = productoRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado con el id: " + id));
        producto.setNombre(productoDetalles.getNombre());
        producto.setPrecio(productoDetalles.getPrecio());
        producto.setStock(productoDetalles.getStock());
        return productoRepositorio.save(producto);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoRepositorio.deleteById(id);
    }
}