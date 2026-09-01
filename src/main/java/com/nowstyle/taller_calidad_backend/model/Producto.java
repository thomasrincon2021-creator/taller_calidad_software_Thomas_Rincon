package com.nowstyle.taller_calidad_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    
    @Column(length = 500)
    private String descripcion;
    
    private String categoria;
    private String color;
    private Double precio;

    @Column(columnDefinition = "TEXT")
    private String tallasStock; 
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imagen;

    public Producto() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }

    public String getTallasStock() { return tallasStock; }
    public void setTallasStock(String tallasStock) { this.tallasStock = tallasStock; }

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
}