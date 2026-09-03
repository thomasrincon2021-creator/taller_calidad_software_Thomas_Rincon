package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {
    

    @Autowired
    private PedidoRepository pedidoRepository;

    // Obtener todos los pedidos (para ADMIN / EMPLEADO)
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {
        return ResponseEntity.ok(pedidoRepository.findAllByOrderByFechaDesc());
    }

    // Obtener pedidos por el email del usuario (para CLIENTE)
    @GetMapping("/usuario/{email}")
    public ResponseEntity<List<Pedido>> obtenerPedidosPorUsuario(@PathVariable String email) {
        return ResponseEntity.ok(pedidoRepository.findByUsuarioEmailOrderByFechaDesc(email));
    }
}