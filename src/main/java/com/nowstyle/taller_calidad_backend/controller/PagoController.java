package com.nowstyle.taller_calidad_backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping; // Ajusta el paquete según tu estructura
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nowstyle.taller_calidad_backend.dto.OrdenDTO;
import com.nowstyle.taller_calidad_backend.model.DetallePedido;
import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.model.Usuario;
import com.nowstyle.taller_calidad_backend.model.MensajePedido;
import com.nowstyle.taller_calidad_backend.repository.PedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.MensajePedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:5173")
public class PagoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MensajePedidoRepository mensajePedidoRepository;

    @Value("${mercadopago.access.token}")
    private String mercadoPagoAccessToken;

    @PostMapping("/crear-preferencia")
    public ResponseEntity<?> crearPreferencia(@RequestBody OrdenDTO ordenDTO) {
        try {
            if (ordenDTO.getItems() == null || ordenDTO.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El carrito no puede estar vacío."));
            }

                Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(ordenDTO.getUsuarioEmail());
                boolean usaCuponPrimeraCompra = usuarioOpt.isPresent()
                    && Boolean.TRUE.equals(usuarioOpt.get().getCuponPrimeraCompra())
                    && "NOW20".equalsIgnoreCase(ordenDTO.getCupon());
                double descuento = usaCuponPrimeraCompra
                    ? ordenDTO.getSubtotal() * 0.20
                    : ordenDTO.getDescuento();
                double total = usaCuponPrimeraCompra
                    ? ordenDTO.getSubtotal() - descuento + ordenDTO.getCostoEnvio()
                    : ordenDTO.getTotal();

            // 1. Crear y mapear el pedido desde la petición de React
            Pedido pedido = new Pedido();
            pedido.setUsuarioEmail(ordenDTO.getUsuarioEmail());
            pedido.setDireccionEnvio(ordenDTO.getDireccionEnvio());
            pedido.setCiudadEnvio(ordenDTO.getCiudadEnvio());
            pedido.setSubtotal(ordenDTO.getSubtotal());
            pedido.setDescuento(descuento);
            pedido.setCostoEnvio(ordenDTO.getCostoEnvio());
            pedido.setTotal(total);
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
                pedido = pedidoRepository.save(pedido);
                MensajePedido avisoVenta = new MensajePedido();
                avisoVenta.setPedidoId(pedido.getId());
                avisoVenta.setAutorEmail("sistema@nowstyle.com");
                avisoVenta.setRolAutor("SISTEMA");
                avisoVenta.setMensaje("Nueva venta registrada. Pedido listo para revisar.");
                mensajePedidoRepository.save(avisoVenta);

                    // Pago simulado temporalmente mientras se conecta el proveedor real.
                    pedido.setEstado("APROBADO");
                    pedidoRepository.save(pedido);
                    MensajePedido confirmacion = new MensajePedido();
                    confirmacion.setPedidoId(pedido.getId());
                    confirmacion.setAutorEmail("sistema@nowstyle.com");
                    confirmacion.setRolAutor("SISTEMA");
                    confirmacion.setMensaje("Pago simulado aprobado. El empleado ya puede revisar tu pedido.");
                    mensajePedidoRepository.save(confirmacion);
                if (usaCuponPrimeraCompra) {
                    usuarioOpt.get().setCuponPrimeraCompra(false);
                    usuarioRepository.save(usuarioOpt.get());
                }

                Map<String, Object> respuesta = new HashMap<>();
                    respuesta.put("simulado", true);
                    respuesta.put("pedidoId", pedido.getId());
                    respuesta.put("mensaje", "Pago simulado aprobado correctamente.");

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of(
                    "error", "No se pudo crear la preferencia de pago.",
                    "details", e.getMessage() != null ? e.getMessage() : "Error desconocido"));
        }
    }
}