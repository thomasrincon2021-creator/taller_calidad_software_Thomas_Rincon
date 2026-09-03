package com.nowstyle.taller_calidad_backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private final Map<String, String> codigosPendientes = new HashMap<>();

    // 1. Método para el Registro de Cuenta
    public void enviarCodigoRegistro(String emailDestino) {
        String tituloHtml = "Verificación de cuenta";
        String mensajeHtml = "Hola, nos alegra mucho que quieras unirte a nosotros. Usa el siguiente código para completar tu registro de forma segura:";
        String asunto = "✨ Código de verificación - NowStyle";
        
        enviarCorreo(emailDestino, asunto, tituloHtml, mensajeHtml);
    }

    // 2. Método para la Recuperación de Contraseña
    public void enviarCodigoRecuperacion(String emailDestino) {
        String tituloHtml = "Recuperación de contraseña";
        String mensajeHtml = "Hola, hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar con el proceso:";
        String asunto = "🔑 Código de recuperación de contraseña - NowStyle";
        
        enviarCorreo(emailDestino, asunto, tituloHtml, mensajeHtml);
    }

    // Método interno genérico para armar y enviar el HTML
    private void enviarCorreo(String emailDestino, String asunto, String tituloHtml, String mensajeHtml) {
        String codigo = String.format("%06d", new Random().nextInt(999999));
        codigosPendientes.put(emailDestino, codigo);

        System.out.println("==================================================");
        System.out.println(" > CÓDIGO PARA " + emailDestino + " (" + tituloHtml + "): " + codigo);
        System.out.println("==================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(emailDestino);
            helper.setSubject(asunto);

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; padding: 40px 0; color: #f4f4f5;">
                    <div style="max-width: 480px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #27272a 0%, #09090b 100%); padding: 30px; text-align: center; border-bottom: 1px solid #27272a;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">
                                Now<span style="color: #a855f7;">Style</span>
                            </h1>
                            <p style="color: #a1a1aa; font-size: 13px; margin: 5px 0 0 0;">Tu plataforma de confianza</p>
                        </div>

                        <!-- Body -->
                        <div style="padding: 35px 30px; text-align: center;">
                            <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 10px;">REPLACE_TITLE_HERE</h2>
                            <p style="color: #d4d4d8; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
                                REPLACE_MESSAGE_HERE
                            </p>
                            
                            <!-- Código Box -->
                            <div style="background-color: #27272a; border: 1px dashed #a855f7; border-radius: 8px; padding: 18px; margin-bottom: 30px; display: inline-block;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #a855f7;">
                                    REPLACE_CODE_HERE
                                </span>
                            </div>

                            <p style="color: #71717a; font-size: 13px; margin: 0; line-height: 1.4;">
                                Este código es strictly personal y tiene una validez temporal. Si no solicitaste esta acción, puedes ignorar este mensaje.
                            </p>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #121214; padding: 20px; text-align: center; border-top: 1px solid #27272a;">
                            <p style="color: #52525b; font-size: 11px; margin: 0;">
                                &copy; 2026 NowStyle. Todos los derechos reservados.
                            </p>
                        </div>

                    </div>
                </div>
                """
                .replace("REPLACE_TITLE_HERE", tituloHtml)
                .replace("REPLACE_MESSAGE_HERE", mensajeHtml)
                .replace("REPLACE_CODE_HERE", codigo);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Advertencia: No se pudo enviar el correo físico por un error de red/SSL: " + e.getMessage());
            System.err.println("El proceso continuará utilizando el código generado en la consola.");
        }
    }

    public boolean validarCodigo(String email, String codigoIngresado) {
        String codigoGuardado = codigosPendientes.get(email);
        if (codigoGuardado != null && codigoGuardado.equals(codigoIngresado)) {
            codigosPendientes.remove(email);
            return true;
        }
        return false;
    }
}