package com.nowstyle.taller_calidad_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
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

    private LocalDateTime fecha = LocalDateTime.now();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "pedido_id")
    private List<DetallePedido> items = new ArrayList<>();

    public Pedido() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }

    public String getDireccionEnvio() { return direccionEnvio; }
    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }

    public String getCiudadEnvio() { return ciudadEnvio; }
    public void setCiudadEnvio(String ciudadEnvio) { this.ciudadEnvio = ciudadEnvio; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDescuento() { return descuento; }
    public void setDescuento(Double descuento) { this.descuento = descuento; }

    public Double getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(Double costoEnvio) { this.costoEnvio = costoEnvio; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getMercadoPagoId() { return mercadoPagoId; }
    public void setMercadoPagoId(String mercadoPagoId) { this.mercadoPagoId = mercadoPagoId; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public List<DetallePedido> getItems() { return items; }
    public void setItems(List<DetallePedido> items) { this.items = items; }
}