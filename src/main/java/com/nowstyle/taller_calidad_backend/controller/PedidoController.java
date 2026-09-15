package com.nowstyle.taller_calidad_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.model.MensajePedido;
import com.nowstyle.taller_calidad_backend.repository.PedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.MensajePedidoRepository;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<List<Pedido>> obtenerPedidosPorUsuario(
        @PathVariable String email
    ) {
        return ResponseEntity.ok(
            pedidoRepository.findByUsuarioEmailWithItems(email)
        );
    }

    @GetMapping("/{pedidoId}/mensajes")
    public ResponseEntity<List<MensajePedido>> obtenerMensajes(
        @PathVariable Long pedidoId
    ) {

        List<MensajePedido> mensajes =
            mensajePedidoRepository
                .findByPedidoIdOrderByFechaAsc(pedidoId)
                .stream()
                .map(mensaje -> {

                    if (
                        mensaje.getImagen() != null
                        && mensaje.getMensaje() != null
                        && mensaje.getMensaje()
                            .trim()
                            .equalsIgnoreCase("Imagen adjunta")
                    ) {
                        mensaje.setMensaje(null);
                    }

                    return mensaje;
                })
                .toList();

        return ResponseEntity.ok(mensajes);
    }

    @PostMapping("/{pedidoId}/mensajes")
    public ResponseEntity<?> enviarMensaje(
        @PathVariable Long pedidoId,
        HttpServletRequest request
    ) {

        try {

            String rawBody =
                request.getReader()
                    .lines()
                    .collect(
                        java.util.stream.Collectors.joining(
                            System.lineSeparator()
                        )
                    );

            if (rawBody == null || rawBody.isBlank()) {
                return ResponseEntity.badRequest().body(
                    "El cuerpo del mensaje es obligatorio."
                );
            }

            Map<String, Object> datos =
                new ObjectMapper().readValue(
                    rawBody,
                    Map.class
                );

            String mensajeTexto =
                datos.get("mensaje") != null
                    ? String.valueOf(
                        datos.get("mensaje")
                    ).trim()
                    : "";

            String imagen =
                datos.get("imagen") != null
                    ? String.valueOf(
                        datos.get("imagen")
                    ).trim()
                    : null;

            String autorEmail =
                datos.get("autorEmail") != null
                    ? String.valueOf(
                        datos.get("autorEmail")
                    ).trim()
                    : "";

            String rolAutor =
                datos.get("rolAutor") != null
                    ? String.valueOf(
                        datos.get("rolAutor")
                    ).trim()
                    : "CLIENTE";

            boolean tieneTexto =
                !mensajeTexto.isEmpty();

            boolean tieneImagen =
                imagen != null && !imagen.isBlank();

            if (!tieneTexto && !tieneImagen) {
                return ResponseEntity.badRequest().body(
                    "El mensaje no puede estar vacío."
                );
            }

            if (!pedidoRepository.existsById(pedidoId)) {
                return ResponseEntity.notFound().build();
            }

            MensajePedido mensaje =
                new MensajePedido();

            mensaje.setPedidoId(pedidoId);
            mensaje.setAutorEmail(autorEmail);
            mensaje.setRolAutor(rolAutor);
            mensaje.setMensaje(
                tieneTexto ? mensajeTexto : null
            );
            mensaje.setImagen(
                tieneImagen ? imagen : null
            );

            return ResponseEntity.ok(
                mensajePedidoRepository.save(mensaje)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "error",
                    "No se pudo procesar el cuerpo del mensaje.",
                    "details",
                    e.getMessage() != null
                        ? e.getMessage()
                        : "Error desconocido"
                )
            );
        }
    }

    @PatchMapping("/{pedidoId}/estado")
    public ResponseEntity<?> actualizarEstado(
        @PathVariable Long pedidoId,
        @RequestBody Map<String, String> datos
    ) {

        return pedidoRepository.findById(pedidoId)
            .map(pedido -> {

                String estado =
                    datos.get("estado");

                if (estado == null || estado.isBlank()) {
                    return ResponseEntity.badRequest().body(
                        "El estado es obligatorio."
                    );
                }

                pedido.setEstado(
                    estado.toUpperCase()
                );

                return ResponseEntity.ok(
                    pedidoRepository.save(pedido)
                );
            })
            .orElseGet(
                () -> ResponseEntity.notFound().build()
            );
    }
}