package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.model.DetallePedido;
import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.repository.PedidoRepository;
import com.nowstyle.taller_calidad_backend.dto.OrdenDTO; // Ajusta el paquete según tu estructura
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @PostMapping("/crear-preferencia")
    public ResponseEntity<?> crearPreferencia(@RequestBody OrdenDTO ordenDTO) {
        try {
            // 1. Crear y mapear el pedido desde la petición de React
            Pedido pedido = new Pedido();
            pedido.setUsuarioEmail(ordenDTO.getUsuarioEmail());
            pedido.setDireccionEnvio(ordenDTO.getDireccionEnvio());
            pedido.setCiudadEnvio(ordenDTO.getCiudadEnvio());
            pedido.setSubtotal(ordenDTO.getSubtotal());
            pedido.setDescuento(ordenDTO.getDescuento());
            pedido.setCostoEnvio(ordenDTO.getCostoEnvio());
            pedido.setTotal(ordenDTO.getTotal());
            pedido.setEstado("PENDIENTE");

            // Convertir la lista de items a DetallePedido
            if (ordenDTO.getItems() != null) {
                List<DetallePedido> detalles = ordenDTO.getItems().stream().map(item -> {
                    DetallePedido detalle = new DetallePedido();
                    detalle.setProductoId(item.getProductoId());
                    detalle.setNombre(item.getNombre());
                    detalle.setCantidad(item.getCantidad());
                    detalle.setTalla(item.getTalla());
                    detalle.setPrecioUnitario(item.getPrecioUnitario());
                    return detalle;
                }).collect(Collectors.toList());

                pedido.setItems(detalles);
            }

            // 2. Guardar en MySQL
            pedidoRepository.save(pedido);

            // 3. Simulación / Integración con Mercado Pago
            // (Reemplaza este bloque con tus credenciales/cliente SDK de Mercado Pago si ya lo tienes)
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("initPoint", "https://www.mercadopago.com"); // Reemplazar con preference.getInitPoint()
            
            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar el pedido: " + e.getMessage());
        }
    }
}