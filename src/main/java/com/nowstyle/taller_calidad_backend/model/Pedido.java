package com.nowstyle.taller_calidad_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usuarioEmail;
    private String direccionEnvio;
    private String ciudadEnvio;

    private Double subtotal;
    private Double descuento;
    private Double costoEnvio;
    private Double total;

    private String estado = "PENDIENTE";
    private String mercadoPagoId;

    private LocalDateTime fecha =
            LocalDateTime.now(ZoneId.of("America/Bogota"));

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "pedido_id")
    private List<DetallePedido> items = new ArrayList<>();

    public Pedido() {
        // Constructor vacío requerido por JPA/Hibernate para crear la entidad.
    }
}