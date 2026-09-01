package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.model.Producto;
import com.nowstyle.taller_calidad_backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @PostMapping
    public Producto guardarProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        productoRepository.deleteById(id);        
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(@PathVariable Long id, @RequestBody Producto productoDetalles) {
        return productoRepository.findById(id).map(producto -> {
            producto.setNombre(productoDetalles.getNombre());
            producto.setDescripcion(productoDetalles.getDescripcion());
            producto.setCategoria(productoDetalles.getCategoria());
            producto.setColor(productoDetalles.getColor());
            producto.setPrecio(productoDetalles.getPrecio());
            producto.setTallasStock(productoDetalles.getTallasStock());
            producto.setImagen(productoDetalles.getImagen()); // <-- CORREGIDO: setImagen con 'n'
            return productoRepository.save(producto);
        }).orElseGet(() -> {
            productoDetalles.setId(id);
            return productoRepository.save(productoDetalles);
        });
    }
}