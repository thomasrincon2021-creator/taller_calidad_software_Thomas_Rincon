package com.nowstyle.taller_calidad_backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nowstyle.taller_calidad_backend.model.DetallePedido;
import com.nowstyle.taller_calidad_backend.model.MensajePedido;
import com.nowstyle.taller_calidad_backend.model.Pedido;
import com.nowstyle.taller_calidad_backend.model.Producto;
import com.nowstyle.taller_calidad_backend.model.Usuario;
import com.nowstyle.taller_calidad_backend.repository.MensajePedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.PedidoRepository;
import com.nowstyle.taller_calidad_backend.repository.ProductoRepository;
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
    private ProductoRepository productoRepository;

    @Autowired
    private MensajePedidoRepository mensajePedidoRepository;

    @Value("${mercadopago.access.token}")
    private String mercadoPagoAccessToken;

    /**
     * Representa un producto del carrito preparado para validar y actualizar
     * posteriormente el inventario.
     */
    private static class ItemStock {
        private Long productoId;
        private String talla;
        private Integer cantidad;

        public ItemStock(Long productoId, String talla, Integer cantidad) {
            this.productoId = productoId;
            this.talla = talla;
            this.cantidad = cantidad;
        }

        public Long getProductoId() {
            return productoId;
        }

        public String getTalla() {
            return talla;
        }

        public Integer getCantidad() {
            return cantidad;
        }
    }

    /**
     * Convierte el campo tallasStock del producto a un mapa.
     *
     * Ejemplo:
     * "S:10,M:15,L:20"
     *
     * se convierte en:
     * S -> 10
     * M -> 15
     * L -> 20
     */
    private Map<String, Integer> obtenerStockPorTalla(String tallasStock) {

        Map<String, Integer> stockPorTalla = new LinkedHashMap<>();

        if (tallasStock == null || tallasStock.isBlank()) {
            return stockPorTalla;
        }

        String[] pares = tallasStock.split(",");

        for (String par : pares) {

            String valor = par.trim();

            if (valor.isEmpty()) {
                continue;
            }

            String[] partes = valor.split(":", 2);

            if (partes.length < 2) {
                continue;
            }

            String talla = partes[0].trim();

            if (talla.isEmpty()) {
                continue;
            }

            try {

                Integer stock = Integer.parseInt(partes[1].trim());

                stockPorTalla.put(
                    talla.toUpperCase(),
                    stock
                );

            } catch (NumberFormatException e) {

                throw new IllegalStateException(
                    "El inventario del producto contiene un stock inválido para la talla "
                    + talla + "."
                );
            }
        }

        return stockPorTalla;
    }

    /**
     * Convierte el mapa de stock nuevamente al formato:
     *
     * S:10,M:15,L:20
     */
    private String convertirStockAString(Map<String, Integer> stockPorTalla) {

        return stockPorTalla.entrySet()
            .stream()
            .map(entry -> entry.getKey() + ":" + entry.getValue())
            .reduce((a, b) -> a + "," + b)
            .orElse("");
    }

    /**
     * Valida que un producto tenga suficiente inventario para una talla.
     *
     * IMPORTANTE:
     * Este método NO modifica el stock.
     * Solo valida.
     */
    private void validarStockProducto(
        Long productoId,
        String talla,
        Integer cantidad
    ) {

        if (productoId == null) {
            throw new IllegalStateException(
                "El producto del carrito no tiene un ID válido."
            );
        }

        if (cantidad == null || cantidad <= 0) {
            throw new IllegalStateException(
                "La cantidad del producto debe ser mayor que cero."
            );
        }

        Optional<Producto> productoOpt =
            productoRepository.findById(productoId);

        if (productoOpt.isEmpty()) {
            throw new IllegalStateException(
                "No se encontró el producto con ID " + productoId + "."
            );
        }

        Producto producto = productoOpt.get();

        Map<String, Integer> stockPorTalla =
            obtenerStockPorTalla(producto.getTallasStock());

        String tallaBuscada =
            talla == null || talla.isBlank()
                ? "Única"
                : talla.trim();

        String tallaNormalizada =
            tallaBuscada.toUpperCase();

        Integer stockActual =
            stockPorTalla.get(tallaNormalizada);

        if (stockActual == null) {
            throw new IllegalStateException(
                "La talla " + tallaBuscada
                + " no está disponible en el inventario del producto "
                + producto.getNombre() + "."
            );
        }

        if (stockActual < cantidad) {
            throw new IllegalStateException(
                "No hay suficiente stock para la talla "
                + tallaBuscada
                + ". Stock disponible: "
                + stockActual
                + ", cantidad solicitada: "
                + cantidad
                + "."
            );
        }
    }

    /**
     * Descuenta el inventario de un producto.
     *
     * Este método se ejecuta SOLO después de haber validado
     * todos los productos del carrito.
     */
    private void actualizarStockProducto(
        Long productoId,
        String talla,
        Integer cantidad
    ) {

        Optional<Producto> productoOpt =
            productoRepository.findById(productoId);

        if (productoOpt.isEmpty()) {
            throw new IllegalStateException(
                "No se encontró el producto con ID " + productoId + "."
            );
        }

        Producto producto = productoOpt.get();

        Map<String, Integer> stockPorTalla =
            obtenerStockPorTalla(producto.getTallasStock());

        String tallaBuscada =
            talla == null || talla.isBlank()
                ? "Única"
                : talla.trim();

        String tallaNormalizada =
            tallaBuscada.toUpperCase();

        Integer stockActual =
            stockPorTalla.get(tallaNormalizada);

        if (stockActual == null) {
            throw new IllegalStateException(
                "La talla " + tallaBuscada
                + " no está disponible en el inventario."
            );
        }

        if (stockActual < cantidad) {
            throw new IllegalStateException(
                "No hay suficiente stock para la talla "
                + tallaBuscada + "."
            );
        }

        int nuevoStock =
            stockActual - cantidad;

        stockPorTalla.put(
            tallaNormalizada,
            nuevoStock
        );

        String nuevoTallasStock =
            convertirStockAString(stockPorTalla);

        producto.setTallasStock(nuevoTallasStock);

        productoRepository.save(producto);
    }

    /**
     * Crea el pedido y realiza el descuento de inventario.
     *
     * @Transactional permite que si algo falla durante el proceso,
     * las modificaciones realizadas en la base de datos puedan revertirse.
     */
    @PostMapping("/crear-preferencia")
    @Transactional
    public ResponseEntity<?> crearPreferencia(
        @RequestBody Map<String, Object> ordenData
    ) {

        try {

            // =========================================================
            // 1. VALIDAR CARRITO
            // =========================================================

            if (
                ordenData == null
                || ordenData.isEmpty()
                || !(ordenData.get("items") instanceof List)
                || ((List<?>) ordenData.get("items")).isEmpty()
            ) {

                return ResponseEntity.badRequest().body(
                    Map.of(
                        "error",
                        "El carrito no puede estar vacío."
                    )
                );
            }

            // =========================================================
            // 2. OBTENER DATOS GENERALES DEL PEDIDO
            // =========================================================

            String usuarioEmail =
                ordenData.get("usuarioEmail") != null
                    ? String.valueOf(
                        ordenData.get("usuarioEmail")
                    ).trim()
                    : "";

            String direccionEnvio =
                ordenData.get("direccionEnvio") != null
                    ? String.valueOf(
                        ordenData.get("direccionEnvio")
                    ).trim()
                    : "";

            String ciudadEnvio =
                ordenData.get("ciudadEnvio") != null
                    ? String.valueOf(
                        ordenData.get("ciudadEnvio")
                    ).trim()
                    : "";

            String cupon =
                ordenData.get("cupon") != null
                    ? String.valueOf(
                        ordenData.get("cupon")
                    ).trim()
                    : "";

            String mensajePedido =
                ordenData.get("mensajePedido") != null
                    ? String.valueOf(
                        ordenData.get("mensajePedido")
                    ).trim()
                    : "";

            Double subtotal =
                ordenData.get("subtotal") instanceof Number
                    ? ((Number) ordenData.get("subtotal")).doubleValue()
                    : 0d;

            Double descuento =
                ordenData.get("descuento") instanceof Number
                    ? ((Number) ordenData.get("descuento")).doubleValue()
                    : 0d;

            Double costoEnvio =
                ordenData.get("costoEnvio") instanceof Number
                    ? ((Number) ordenData.get("costoEnvio")).doubleValue()
                    : 0d;

            Double total =
                ordenData.get("total") instanceof Number
                    ? ((Number) ordenData.get("total")).doubleValue()
                    : 0d;

            // =========================================================
            // 3. VALIDAR USUARIO Y CUPÓN
            // =========================================================

            Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(usuarioEmail);

            boolean usaCuponPrimeraCompra =
                usuarioOpt.isPresent()
                && Boolean.TRUE.equals(
                    usuarioOpt.get().getCuponPrimeraCompra()
                )
                && "NOW20".equalsIgnoreCase(cupon);

            double descuentoAplicado =
                usaCuponPrimeraCompra
                    ? subtotal * 0.20
                    : descuento;

            double totalFinal =
                usaCuponPrimeraCompra
                    ? subtotal - descuentoAplicado + costoEnvio
                    : total;

            // =========================================================
            // 4. OBTENER ITEMS DEL CARRITO
            // =========================================================

            List<?> itemsRaw =
                (List<?>) ordenData.get("items");

            List<DetallePedido> detalles =
                new ArrayList<>();

            List<ItemStock> itemsParaStock =
                new ArrayList<>();

            // =========================================================
            // 5. PRIMERA PASADA:
            // CREAR DETALLES Y VALIDAR TODO EL STOCK
            // =========================================================

            for (Object itemRaw : itemsRaw) {

                if (!(itemRaw instanceof Map)) {

                    throw new IllegalStateException(
                        "Uno de los elementos del carrito no tiene un formato válido."
                    );
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> itemMap =
                    (Map<String, Object>) itemRaw;

                Long productoId =
                    itemMap.get("productoId") instanceof Number
                        ? ((Number) itemMap.get("productoId")).longValue()
                        : null;

                Integer cantidad =
                    itemMap.get("cantidad") instanceof Number
                        ? ((Number) itemMap.get("cantidad")).intValue()
                        : 1;

                String talla =
                    itemMap.get("talla") != null
                        ? String.valueOf(
                            itemMap.get("talla")
                        )
                        : "Única";

                // ---------------------------------------------
                // Validar producto y stock
                // ---------------------------------------------

                validarStockProducto(
                    productoId,
                    talla,
                    cantidad
                );

                itemsParaStock.add(
                    new ItemStock(
                        productoId,
                        talla,
                        cantidad
                    )
                );

                // ---------------------------------------------
                // Crear detalle del pedido
                // ---------------------------------------------

                DetallePedido detalle =
                    new DetallePedido();

                detalle.setProductoId(productoId);

                detalle.setNombre(
                    itemMap.get("nombre") != null
                        ? String.valueOf(
                            itemMap.get("nombre")
                        )
                        : ""
                );

                detalle.setCantidad(cantidad);

                detalle.setTalla(talla);

                detalle.setPrecioUnitario(
                    itemMap.get("precioUnitario") instanceof Number
                        ? ((Number) itemMap.get("precioUnitario")).doubleValue()
                        : 0d
                );

                detalle.setModelo3d(
                    itemMap.get("modelo3d") != null
                        ? String.valueOf(
                            itemMap.get("modelo3d")
                        )
                        : ""
                );

                detalle.setColorHex(
                    itemMap.get("colorHex") != null
                        ? String.valueOf(
                            itemMap.get("colorHex")
                        )
                        : ""
                );

                detalle.setCategoria(
                    itemMap.get("categoria") != null
                        ? String.valueOf(
                            itemMap.get("categoria")
                        )
                        : ""
                );

                detalle.setImagen(
                    itemMap.get("imagen") != null
                        ? String.valueOf(
                            itemMap.get("imagen")
                        )
                        : ""
                );

                detalle.setPersonalizacion(
                    itemMap.get("personalizacion") != null
                        ? String.valueOf(
                            itemMap.get("personalizacion")
                        )
                        : null
                );

                detalles.add(detalle);
            }

            // =========================================================
            // 6. SEGUNDA PASADA:
            // DESCONTAR STOCK
            // =========================================================

            for (ItemStock item : itemsParaStock) {

                actualizarStockProducto(
                    item.getProductoId(),
                    item.getTalla(),
                    item.getCantidad()
                );
            }

            // =========================================================
            // 7. CREAR PEDIDO
            // =========================================================

            Pedido pedido =
                new Pedido();

            pedido.setUsuarioEmail(
                usuarioEmail
            );

            pedido.setDireccionEnvio(
                direccionEnvio
            );

            pedido.setCiudadEnvio(
                ciudadEnvio
            );

            pedido.setSubtotal(
                subtotal
            );

            pedido.setDescuento(
                descuentoAplicado
            );

            pedido.setCostoEnvio(
                costoEnvio
            );

            pedido.setTotal(
                totalFinal
            );

            pedido.setEstado(
                "PENDIENTE"
            );

            pedido.setItems(
                detalles
            );

            pedido =
                pedidoRepository.save(pedido);

            // =========================================================
            // 8. MENSAJE DEL CLIENTE
            // =========================================================

            if (!mensajePedido.isBlank()) {

                MensajePedido mensajeCliente =
                    new MensajePedido();

                mensajeCliente.setPedidoId(
                    pedido.getId()
                );

                mensajeCliente.setAutorEmail(
                    usuarioEmail
                );

                mensajeCliente.setRolAutor(
                    "CLIENTE"
                );

                mensajeCliente.setMensaje(
                    mensajePedido.trim()
                );

                mensajePedidoRepository.save(
                    mensajeCliente
                );
            }

            // =========================================================
            // 9. AVISO DE NUEVA VENTA
            // =========================================================

            MensajePedido avisoVenta =
                new MensajePedido();

            avisoVenta.setPedidoId(
                pedido.getId()
            );

            avisoVenta.setAutorEmail(
                "sistema@nowstyle.com"
            );

            avisoVenta.setRolAutor(
                "SISTEMA"
            );

            avisoVenta.setMensaje(
                "Nueva venta registrada. Pedido listo para revisar."
            );

            mensajePedidoRepository.save(
                avisoVenta
            );

            // =========================================================
            // 10. APROBAR PEDIDO
            // =========================================================

            pedido.setEstado(
                "APROBADO"
            );

            pedidoRepository.save(
                pedido
            );

            // =========================================================
            // 11. MENSAJE DE CONFIRMACIÓN
            // =========================================================

            MensajePedido confirmacion =
                new MensajePedido();

            confirmacion.setPedidoId(
                pedido.getId()
            );

            confirmacion.setAutorEmail(
                "sistema@nowstyle.com"
            );

            confirmacion.setRolAutor(
                "SISTEMA"
            );

            confirmacion.setMensaje(
                "Pago simulado aprobado. El empleado ya puede revisar tu pedido."
            );

            mensajePedidoRepository.save(
                confirmacion
            );

            // =========================================================
            // 12. DESACTIVAR CUPÓN DE PRIMERA COMPRA
            // =========================================================

            if (
                usaCuponPrimeraCompra
                && usuarioOpt.isPresent()
            ) {

                usuarioOpt.get()
                    .setCuponPrimeraCompra(false);

                usuarioRepository.save(
                    usuarioOpt.get()
                );
            }

            // =========================================================
            // 13. RESPUESTA AL FRONTEND
            // =========================================================

            Map<String, Object> respuesta =
                new HashMap<>();

            respuesta.put(
                "simulado",
                true
            );

            respuesta.put(
                "pedidoId",
                pedido.getId()
            );

            respuesta.put(
                "mensaje",
                "Pago simulado aprobado correctamente."
            );

            return ResponseEntity.ok(
                respuesta
            );

        } catch (IllegalStateException e) {

            // Errores de inventario o validación
            return ResponseEntity.badRequest().body(
                Map.of(
                    "error",
                    e.getMessage() != null
                        ? e.getMessage()
                        : "Error de validación."
                )
            );

        } catch (Exception e) {

            // Cualquier otro error
            return ResponseEntity.internalServerError().body(
                Map.of(
                    "error",
                    "No se pudo crear la preferencia de pago.",
                    "details",
                    e.getMessage() != null
                        ? e.getMessage()
                        : "Error desconocido"
                )
            );
        }
    }
}

