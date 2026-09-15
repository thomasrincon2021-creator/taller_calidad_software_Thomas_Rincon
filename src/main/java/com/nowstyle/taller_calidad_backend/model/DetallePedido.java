package com.nowstyle.taller_calidad_backend.model;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detalle_pedidos")
@Getter
@Setter
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productoId;
    private String nombre;
    private Integer cantidad;
    private String talla;
    private Double precioUnitario;
    private String modelo3d;
    private String colorHex;
    private String categoria;

    @Column(columnDefinition = "LONGTEXT")
    private String imagen;

    @Column(columnDefinition = "LONGTEXT")
    private String personalizacion;

    public DetallePedido() {
        // Constructor vacío requerido por JPA/Hibernate para crear la entidad.
    }
}