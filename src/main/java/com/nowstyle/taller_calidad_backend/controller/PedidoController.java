package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.model.MensajePedido;
import com.nowstyle.taller_calidad_backend.repository.PedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.MensajePedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PedidoController {
    

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private MensajePedidoRepository mensajePedidoRepository;

    // Obtener todos los pedidos (para ADMIN / EMPLEADO)
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {
        return ResponseEntity.ok(pedidoRepository.findAllWithItems());
    }

    // Obtener pedidos por el email del usuario (para CLIENTE)
    @GetMapping("/usuario/{email}")
    public ResponseEntity<List<Pedido>> obtenerPedidosPorUsuario(@PathVariable String email) {
        return ResponseEntity.ok(pedidoRepository.findByUsuarioEmailWithItems(email));
    }

    @GetMapping("/{pedidoId}/mensajes")
    public ResponseEntity<List<MensajePedido>> obtenerMensajes(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(mensajePedidoRepository.findByPedidoIdOrderByFechaAsc(pedidoId));
    }

    @PostMapping("/{pedidoId}/mensajes")
    public ResponseEntity<?> enviarMensaje(@PathVariable Long pedidoId, @RequestBody MensajePedido mensaje) {
        if (mensaje.getMensaje() == null || mensaje.getMensaje().isBlank()) {
            return ResponseEntity.badRequest().body("El mensaje no puede estar vacío.");
        }

        if (!pedidoRepository.existsById(pedidoId)) {
            return ResponseEntity.notFound().build();
        }

        mensaje.setPedidoId(pedidoId);
        mensaje.setMensaje(mensaje.getMensaje().trim());
        return ResponseEntity.ok(mensajePedidoRepository.save(mensaje));
    }

    @PatchMapping("/{pedidoId}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long pedidoId, @RequestBody Map<String, String> datos) {
        return pedidoRepository.findById(pedidoId).map(pedido -> {
            String estado = datos.get("estado");
            if (estado == null || estado.isBlank()) {
                return ResponseEntity.badRequest().body("El estado es obligatorio.");
            }
            pedido.setEstado(estado.toUpperCase());
            return ResponseEntity.ok(pedidoRepository.save(pedido));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}