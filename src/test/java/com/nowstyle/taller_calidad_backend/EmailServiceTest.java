package com.nowstyle.taller_calidad_backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.lang.reflect.Field;
import java.util.Map;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import com.nowstyle.taller_calidad_backend.service.EmailService;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        mimeMessage = new MimeMessage(Session.getInstance(System.getProperties()));
    }

    @Test
    void enviarCodigoRegistroCorrectamente() throws Exception {

        when(mailSender.createMimeMessage())
                .thenReturn(mimeMessage);

        emailService.enviarCodigoRegistro("cliente@gmail.com");

        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);

        Map<String, String> codigos = obtenerCodigosPendientes();

        assertTrue(codigos.containsKey("cliente@gmail.com"));
        assertNotNull(codigos.get("cliente@gmail.com"));
        assertEquals(6, codigos.get("cliente@gmail.com").length());
    }

    @Test
    void enviarCodigoRecuperacionCorrectamente() throws Exception {

        when(mailSender.createMimeMessage())
                .thenReturn(mimeMessage);

        emailService.enviarCodigoRecuperacion("cliente@gmail.com");

        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);

        Map<String, String> codigos = obtenerCodigosPendientes();

        assertTrue(codigos.containsKey("cliente@gmail.com"));
        assertNotNull(codigos.get("cliente@gmail.com"));
        assertEquals(6, codigos.get("cliente@gmail.com").length());
    }

    @Test
    void enviarCorreoCuandoOcurreError() throws Exception {

        when(mailSender.createMimeMessage())
                .thenThrow(new RuntimeException("Error de correo"));

        assertDoesNotThrow(() ->
                emailService.enviarCodigoRegistro("cliente@gmail.com")
        );

        verify(mailSender).createMimeMessage();

        Map<String, String> codigos = obtenerCodigosPendientes();

        assertTrue(codigos.containsKey("cliente@gmail.com"));
        assertNotNull(codigos.get("cliente@gmail.com"));
    }

    @Test
    void validarCodigoCorrecto() throws Exception {

        when(mailSender.createMimeMessage())
                .thenReturn(mimeMessage);

        emailService.enviarCodigoRegistro("cliente@gmail.com");

        Map<String, String> codigos = obtenerCodigosPendientes();

        String codigo = codigos.get("cliente@gmail.com");

        assertTrue(
                emailService.validarCodigo(
                        "cliente@gmail.com",
                        codigo
                )
        );

        assertFalse(
                codigos.containsKey("cliente@gmail.com")
        );
    }

    @Test
    void validarCodigoIncorrecto() throws Exception {

        when(mailSender.createMimeMessage())
                .thenReturn(mimeMessage);

        emailService.enviarCodigoRegistro("cliente@gmail.com");

        assertFalse(
                emailService.validarCodigo(
                        "cliente@gmail.com",
                        "999999"
                )
        );
    }

    @Test
    void validarCodigoCuandoNoExiste() {

        assertFalse(
                emailService.validarCodigo(
                        "noexiste@gmail.com",
                        "123456"
                )
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> obtenerCodigosPendientes()
            throws Exception {

        Field field =
                EmailService.class.getDeclaredField(
                        "codigosPendientes"
                );

        field.setAccessible(true);

        return (Map<String, String>) field.get(emailService);
    }
}