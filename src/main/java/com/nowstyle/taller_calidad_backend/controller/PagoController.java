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

    private static final String TALLA_UNICA = "Única";
    private static final String CAMPO_ERROR = "error";

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
     */
    private Map<String, Integer> obtenerStockPorTalla(String tallasStock) {

        Map<String, Integer> stockPorTalla = new LinkedHashMap<>();

        if (tallasStock == null || tallasStock.isBlank()) {
            return stockPorTalla;
        }

        String[] pares = tallasStock.split(",");

        for (String par : pares) {
            procesarParStock(par, stockPorTalla);
        }

        return stockPorTalla;
    }

    /**
     * Procesa un elemento individual del inventario por talla.
     */
    private void procesarParStock(
        String par,
        Map<String, Integer> stockPorTalla
    ) {

        String valor = par.trim();

        if (valor.isEmpty()) {
            return;
        }

        String[] partes = valor.split(":", 2);

        if (partes.length < 2) {
            return;
        }

        String talla = partes[0].trim();

        if (talla.isEmpty()) {
            return;
        }

        try {

            Integer stock = Integer.parseInt(
                partes[1].trim()
            );

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

    /**
     * Convierte el mapa de stock nuevamente al formato:
     * S:10,M:15,L:20
     */
    private String convertirStockAString(
        Map<String, Integer> stockPorTalla
    ) {

        return stockPorTalla.entrySet()
            .stream()
            .map(entry -> entry.getKey() + ":" + entry.getValue())
            .reduce((a, b) -> a + "," + b)
            .orElse("");
    }

    /**
     * Valida que un producto tenga suficiente inventario para una talla.
     */
    private void validarStockProducto(
        Long productoId,
        String talla,
        Integer cantidad
    ) {

        validarDatosStock(productoId, cantidad);

        Producto producto = obtenerProducto(productoId);

        Map<String, Integer> stockPorTalla =
            obtenerStockPorTalla(producto.getTallasStock());

        String tallaBuscada = normalizarTalla(talla);
        String tallaNormalizada = tallaBuscada.toUpperCase();

        Integer stockActual =
            stockPorTalla.get(tallaNormalizada);

        validarDisponibilidadStock(
            stockActual,
            tallaBuscada,
            producto.getNombre(),
            cantidad
        );
    }

    /**
     * Valida los datos básicos del producto del carrito.
     */
    private void validarDatosStock(
        Long productoId,
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
    }

    /**
     * Obtiene un producto por su ID.
     */
    private Producto obtenerProducto(Long productoId) {

        Optional<Producto> productoOpt =
            productoRepository.findById(productoId);

        if (productoOpt.isEmpty()) {
            throw new IllegalStateException(
                "No se encontró el producto con ID " + productoId + "."
            );
        }

        return productoOpt.get();
    }

    /**
     * Normaliza la talla recibida desde el carrito.
     */
    private String normalizarTalla(String talla) {

        if (talla == null || talla.isBlank()) {
            return TALLA_UNICA;
        }

        return talla.trim();
    }

    /**
     * Valida que exista suficiente inventario.
     */
    private void validarDisponibilidadStock(
        Integer stockActual,
        String talla,
        String nombreProducto,
        Integer cantidad
    ) {

        if (stockActual == null) {
            throw new IllegalStateException(
                "La talla " + talla
                + " no está disponible en el inventario del producto "
                + nombreProducto + "."
            );
        }

        if (stockActual < cantidad) {
            throw new IllegalStateException(
                "No hay suficiente stock para la talla "
                + talla
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
     */
    private void actualizarStockProducto(
        Long productoId,
        String talla,
        Integer cantidad
    ) {

        Producto producto = obtenerProducto(productoId);

        Map<String, Integer> stockPorTalla =
            obtenerStockPorTalla(producto.getTallasStock());

        String tallaBuscada = normalizarTalla(talla);
        String tallaNormalizada = tallaBuscada.toUpperCase();

        Integer stockActual =
            stockPorTalla.get(tallaNormalizada);

        validarStockParaActualizar(
            stockActual,
            tallaBuscada,
            cantidad
        );

        int nuevoStock =
            stockActual - cantidad;

        stockPorTalla.put(
            tallaNormalizada,
            nuevoStock
        );

        producto.setTallasStock(
            convertirStockAString(stockPorTalla)
        );

        productoRepository.save(producto);
    }

    /**
     * Valida el stock antes de realizar el descuento.
     */
    private void validarStockParaActualizar(
        Integer stockActual,
        String talla,
        Integer cantidad
    ) {

        if (stockActual == null) {
            throw new IllegalStateException(
                "La talla " + talla
                + " no está disponible en el inventario."
            );
        }

        if (stockActual < cantidad) {
            throw new IllegalStateException(
                "No hay suficiente stock para la talla "
                + talla + "."
            );
        }
    }

    /**
     * Obtiene un valor String del mapa de datos.
     */
    private String obtenerTexto(
        Map<String, Object> datos,
        String campo
    ) {

        Object valor = datos.get(campo);

        if (valor == null) {
            return "";
        }

        return String.valueOf(valor).trim();
    }

    /**
     * Obtiene un valor numérico Double.
     */
    private Double obtenerDouble(
        Map<String, Object> datos,
        String campo
    ) {

        Object valor = datos.get(campo);

        if (valor instanceof Number number) {
            return number.doubleValue();
        }

        return 0d;
    }

    /**
     * Obtiene un valor numérico Long.
     */
    private Long obtenerLong(
        Map<String, Object> datos,
        String campo
    ) {

        Object valor = datos.get(campo);

        if (valor instanceof Number number) {
            return number.longValue();
        }

        return null;
    }

    /**
     * Obtiene un valor numérico Integer.
     */
    private Integer obtenerInteger(
        Map<String, Object> datos,
        String campo
    ) {

        Object valor = datos.get(campo);

        if (valor instanceof Number number) {
            return number.intValue();
        }

        return 1;
    }

    /**
     * Verifica que el carrito tenga elementos válidos.
     */
    private void validarCarrito(
        Map<String, Object> ordenData
    ) {

        if (
            ordenData == null
            || ordenData.isEmpty()
            || !(ordenData.get("items") instanceof List)
            || ((List<?>) ordenData.get("items")).isEmpty()
        ) {

            throw new IllegalStateException(
                "El carrito no puede estar vacío."
            );
        }
    }

    /**
     * Obtiene la lista de elementos del carrito.
     */
    private List<?> obtenerItems(
        Map<String, Object> ordenData
    ) {

        return (List<?>) ordenData.get("items");
    }

    /**
     * Crea los detalles del pedido y prepara el inventario.
     */
    private List<DetallePedido> crearDetallesPedido(
        List<?> itemsRaw,
        List<ItemStock> itemsParaStock
    ) {

        List<DetallePedido> detalles =
            new ArrayList<>();

        for (Object itemRaw : itemsRaw) {

            Map<String, Object> itemMap =
                convertirItemAMapa(itemRaw);

            Long productoId =
                obtenerLong(itemMap, "productoId");

            Integer cantidad =
                obtenerInteger(itemMap, "cantidad");

            String talla =
                obtenerTalla(itemMap);

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

            detalles.add(
                crearDetallePedido(
                    itemMap,
                    productoId,
                    cantidad,
                    talla
                )
            );
        }

        return detalles;
    }

    /**
     * Convierte un elemento del carrito a un mapa.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> convertirItemAMapa(
        Object itemRaw
    ) {

        if (!(itemRaw instanceof Map)) {
            throw new IllegalStateException(
                "Uno de los elementos del carrito no tiene un formato válido."
            );
        }

        return (Map<String, Object>) itemRaw;
    }

    /**
     * Obtiene la talla del producto.
     */
    private String obtenerTalla(
        Map<String, Object> itemMap
    ) {

        Object talla = itemMap.get("talla");

        if (talla == null) {
            return TALLA_UNICA;
        }

        return String.valueOf(talla);
    }

    /**
     * Crea un detalle del pedido.
     */
    private DetallePedido crearDetallePedido(
        Map<String, Object> itemMap,
        Long productoId,
        Integer cantidad,
        String talla
    ) {

        DetallePedido detalle =
            new DetallePedido();

        detalle.setProductoId(productoId);

        detalle.setNombre(
            obtenerTexto(itemMap, "nombre")
        );

        detalle.setCantidad(cantidad);
        detalle.setTalla(talla);

        detalle.setPrecioUnitario(
            obtenerDouble(
                itemMap,
                "precioUnitario"
            )
        );

        detalle.setModelo3d(
            obtenerTexto(itemMap, "modelo3d")
        );

        detalle.setColorHex(
            obtenerTexto(itemMap, "colorHex")
        );

        detalle.setCategoria(
            obtenerTexto(itemMap, "categoria")
        );

        detalle.setImagen(
            obtenerTexto(itemMap, "imagen")
        );

        Object personalizacion =
            itemMap.get("personalizacion");

        detalle.setPersonalizacion(
            personalizacion != null
                ? String.valueOf(personalizacion)
                : null
        );

        return detalle;
    }

    /**
     * Actualiza el inventario de todos los productos del carrito.
     */
    private void actualizarInventario(
        List<ItemStock> itemsParaStock
    ) {

        for (ItemStock item : itemsParaStock) {

            actualizarStockProducto(
                item.getProductoId(),
                item.getTalla(),
                item.getCantidad()
            );
        }
    }

    /**
     * Crea y guarda el pedido.
     */
    private Pedido guardarPedido(
        String usuarioEmail,
        String direccionEnvio,
        String ciudadEnvio,
        Double subtotal,
        Double descuentoAplicado,
        Double costoEnvio,
        Double totalFinal,
        List<DetallePedido> detalles
    ) {

        Pedido pedido =
            new Pedido();

        pedido.setUsuarioEmail(usuarioEmail);
        pedido.setDireccionEnvio(direccionEnvio);
        pedido.setCiudadEnvio(ciudadEnvio);
        pedido.setSubtotal(subtotal);
        pedido.setDescuento(descuentoAplicado);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setTotal(totalFinal);
        pedido.setEstado("PENDIENTE");
        pedido.setItems(detalles);

        return pedidoRepository.save(pedido);
    }

    /**
     * Guarda los mensajes relacionados con la venta.
     */
    private void guardarMensajesVenta(
        Pedido pedido,
        String usuarioEmail,
        String mensajePedido
    ) {

        if (!mensajePedido.isBlank()) {

            MensajePedido mensajeCliente =
                new MensajePedido();

            mensajeCliente.setPedidoId(pedido.getId());
            mensajeCliente.setAutorEmail(usuarioEmail);
            mensajeCliente.setRolAutor("CLIENTE");
            mensajeCliente.setMensaje(
                mensajePedido.trim()
            );

            mensajePedidoRepository.save(
                mensajeCliente
            );
        }

        MensajePedido avisoVenta =
            new MensajePedido();

        avisoVenta.setPedidoId(pedido.getId());
        avisoVenta.setAutorEmail("sistema@nowstyle.com");
        avisoVenta.setRolAutor("SISTEMA");
        avisoVenta.setMensaje(
            "Nueva venta registrada. Pedido listo para revisar."
        );

        mensajePedidoRepository.save(avisoVenta);
    }

    /**
     * Guarda la confirmación de pago aprobado.
     */
    private void guardarConfirmacionPago(
        Pedido pedido
    ) {

        MensajePedido confirmacion =
            new MensajePedido();

        confirmacion.setPedidoId(pedido.getId());
        confirmacion.setAutorEmail("sistema@nowstyle.com");
        confirmacion.setRolAutor("SISTEMA");
        confirmacion.setMensaje(
            "Pago simulado aprobado. El empleado ya puede revisar tu pedido."
        );

        mensajePedidoRepository.save(confirmacion);
    }

    /**
     * Desactiva el cupón de primera compra utilizado.
     */
    private void actualizarCuponUsuario(
        Optional<Usuario> usuarioOpt,
        boolean usaCuponPrimeraCompra
    ) {

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
    }

    /**
     * Crea la respuesta final.
     */
    private Map<String, Object> crearRespuesta(
        Pedido pedido
    ) {

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

        return respuesta;
    }

    /**
     * Crea la respuesta de error de validación.
     */
    private ResponseEntity<?> respuestaErrorValidacion(
        IllegalStateException e
    ) {

        return ResponseEntity.badRequest().body(
            Map.of(
                CAMPO_ERROR,
                e.getMessage() != null
                    ? e.getMessage()
                    : "Error de validación."
            )
        );
    }

    /**
     * Crea la respuesta de error interno.
     */
    private ResponseEntity<?> respuestaErrorInterno(
        Exception e
    ) {

        return ResponseEntity.internalServerError().body(
            Map.of(
                CAMPO_ERROR,
                "No se pudo crear la preferencia de pago.",
                "details",
                e.getMessage() != null
                    ? e.getMessage()
                    : "Error desconocido"
            )
        );
    }

    @PostMapping("/crear-preferencia")
    @Transactional
    public ResponseEntity<?> crearPreferencia(
        @RequestBody Map<String, Object> ordenData
    ) {

        try {

            validarCarrito(ordenData);

            String usuarioEmail =
                obtenerTexto(
                    ordenData,
                    "usuarioEmail"
                );

            String direccionEnvio =
                obtenerTexto(
                    ordenData,
                    "direccionEnvio"
                );

            String ciudadEnvio =
                obtenerTexto(
                    ordenData,
                    "ciudadEnvio"
                );

            String cupon =
                obtenerTexto(
                    ordenData,
                    "cupon"
                );

            String mensajePedido =
                obtenerTexto(
                    ordenData,
                    "mensajePedido"
                );

            Double subtotal =
                obtenerDouble(
                    ordenData,
                    "subtotal"
                );

            Double descuento =
                obtenerDouble(
                    ordenData,
                    "descuento"
                );

            Double costoEnvio =
                obtenerDouble(
                    ordenData,
                    "costoEnvio"
                );

            Double total =
                obtenerDouble(
                    ordenData,
                    "total"
                );

            Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(
                    usuarioEmail
                );

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

            List<?> itemsRaw =
                obtenerItems(ordenData);

            List<ItemStock> itemsParaStock =
                new ArrayList<>();

            List<DetallePedido> detalles =
                crearDetallesPedido(
                    itemsRaw,
                    itemsParaStock
                );

            actualizarInventario(
                itemsParaStock
            );

            Pedido pedido =
                guardarPedido(
                    usuarioEmail,
                    direccionEnvio,
                    ciudadEnvio,
                    subtotal,
                    descuentoAplicado,
                    costoEnvio,
                    totalFinal,
                    detalles
                );

            guardarMensajesVenta(
                pedido,
                usuarioEmail,
                mensajePedido
            );

            pedido.setEstado("APROBADO");

            pedidoRepository.save(pedido);

            guardarConfirmacionPago(
                pedido
            );

            actualizarCuponUsuario(
                usuarioOpt,
                usaCuponPrimeraCompra
            );

            return ResponseEntity.ok(
                crearRespuesta(pedido)
            );

        } catch (IllegalStateException e) {

            return respuestaErrorValidacion(e);

        } catch (Exception e) {

            return respuestaErrorInterno(e);
        }
    }
}