package com.nowstyle.taller_calidad_backend;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.nowstyle.taller_calidad_backend.config.CorsConfig;

class CorsConfigTest {

    @Test
    void probarConfiguracionCors() {

        CorsConfig config = new CorsConfig();

        WebMvcConfigurer corsConfigurer = config.corsConfigurer();

        assertNotNull(corsConfigurer);

        CorsRegistry registry = new CorsRegistry();

        assertDoesNotThrow(() ->
                corsConfigurer.addCorsMappings(registry)
        );
    }
}