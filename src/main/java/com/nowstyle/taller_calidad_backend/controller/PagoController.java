package com.nowstyle.taller_calidad_backend.controller;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:5173")
public class PagoController {

    @Value("${mercadopago.access.token}")
    private String mpAccessToken;

    @PostMapping("/crear-preferencia")
    public ResponseEntity<?> crearPreferencia(@RequestBody Map<String, Object> pedido) {
        try {
            MercadoPagoConfig.setAccessToken(mpAccessToken);

            List<PreferenceItemRequest> items = new ArrayList<>();

            List<Map<String, Object>> listaItems = (List<Map<String, Object>>) pedido.get("items");
            if (listaItems != null) {
                for (Map<String, Object> item : listaItems) {
                    // Soporta 'precio' o 'precioUnitario' para evitar NullPointerException
                    Object precioObj = item.get("precio") != null ? item.get("precio") : item.get("precioUnitario");
                    
                    if (precioObj != null) {
                        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                                .title((String) item.get("nombre"))
                                .quantity(((Number) item.get("cantidad")).intValue())
                                .unitPrice(new BigDecimal(precioObj.toString()))
                                .currencyId("COP")
                                .build();
                        items.add(itemRequest);
                    }
                }
            }

            Number costoEnvio = (Number) pedido.get("costoEnvio");
            if (costoEnvio != null && costoEnvio.doubleValue() > 0) {
                String ciudad = pedido.get("ciudadEnvio") != null ? pedido.get("ciudadEnvio").toString() : "N/A";
                PreferenceItemRequest envioItem = PreferenceItemRequest.builder()
                        .title("Costo de Envío (" + ciudad + ")")
                        .quantity(1)
                        .unitPrice(new BigDecimal(costoEnvio.toString()))
                        .currencyId("COP")
                        .build();
                items.add(envioItem);
            }

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            Map<String, String> response = new HashMap<>();
            String redirectUrl = preference.getSandboxInitPoint() != null && !preference.getSandboxInitPoint().isEmpty()
                    ? preference.getSandboxInitPoint()
                    : preference.getInitPoint();

            response.put("initPoint", redirectUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}