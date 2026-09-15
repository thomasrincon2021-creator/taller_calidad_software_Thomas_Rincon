package com.nowstyle.taller_calidad_backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrdenDTO {

    private String id;
    private String usuarioEmail;
    private String direccionEnvio;
    private String ciudadEnvio;
    private Double subtotal;
    private Double descuento;
    private Double costoEnvio;
    private Double total;
    private String cupon;
    private String mensajePedido;
    private List<ItemDTO> items;

    public OrdenDTO() {
        // Constructor vacío requerido para la deserialización del DTO.
    }

    @Getter
    @Setter
    public static class ItemDTO {

        private Long productoId;
        private String nombre;
        private String titulo;
        private String talla;
        private Integer cantidad;
        private Double precioUnitario;
        private String modelo3d;
        private String colorHex;
        private String categoria;
        private String imagen;
        private String personalizacion;

        public ItemDTO() {
            // Constructor vacío requerido para la deserialización del DTO.
        }
    }
}