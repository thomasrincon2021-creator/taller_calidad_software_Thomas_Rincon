package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.model.Usuario;
import com.nowstyle.taller_calidad_backend.repository.UsuarioRepository;
import com.nowstyle.taller_calidad_backend.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    private static final String USUARIO_NO_ENCONTRADO =
            "Usuario no encontrado.";

    private static final String EMAIL = "email";

    private static final String ROL_CLIENTE = "CLIENTE";

    private static final String MENSAJE_ERROR_CORREO =
            "El correo electrónico no está asociado a ninguna cuenta.";

    private static final String MENSAJE_USUARIO_INVALIDO =
            "El nombre de usuario no es válido o parece spam.";

    private static final String MENSAJE_CORREO_INVALIDO =
            "Por favor ingresa un correo de Gmail real y válido.";

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    // =========================================================
    // OBTENER TODOS LOS USUARIOS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> obtenerTodosLosUsuarios() {

        List<Usuario> usuarios = usuarioRepository.findAll();

        return ResponseEntity.ok(usuarios);
    }

    // =========================================================
    // OBTENER USUARIO POR ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findById(id);

        if (!usuarioOpt.isPresent()) {

            return ResponseEntity.status(404)
                    .body(USUARIO_NO_ENCONTRADO);
        }

        return ResponseEntity.ok(usuarioOpt.get());
    }

    // =========================================================
    // REGISTRO - PASO 1
    // =========================================================

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(
            @RequestBody Usuario usuario
    ) {

        // Validar usuario contra spam
        if (
            usuario.getUsuario() == null ||
            usuario.getUsuario().length() < 4 ||
            contienePatronSpam(usuario.getUsuario())
        ) {

            return ResponseEntity.badRequest()
                    .body(MENSAJE_USUARIO_INVALIDO);
        }

        // Validar Gmail
        if (
            usuario.getEmail() == null ||
            !usuario.getEmail()
                    .toLowerCase()
                    .endsWith("@gmail.com")
        ) {

            return ResponseEntity.badRequest()
                    .body(
                        "El correo debe ser estrictamente una cuenta @gmail.com."
                    );
        }

        String usernameEmail =
                usuario.getEmail()
                        .toLowerCase()
                        .split("@")[0];

        if (
            usernameEmail.length() < 4 ||
            !contieneVocal(usernameEmail) ||
            contieneCaracterRepetido(usernameEmail)
        ) {

            return ResponseEntity.badRequest()
                    .body(MENSAJE_CORREO_INVALIDO);
        }

        // Validar teléfono colombiano
        if (
            usuario.getTelefono() == null ||
            !telefonoColombianoValido(usuario.getTelefono())
        ) {

            return ResponseEntity.badRequest()
                    .body(
                        "El número de teléfono debe ser válido para Colombia (+57 3XXXXXXXXX)."
                    );
        }

        // Validar contraseña
        if (
            usuario.getPassword() == null ||
            usuario.getPassword().length() < 8
        ) {

            return ResponseEntity.badRequest()
                    .body(
                        "La contraseña debe tener al menos 8 caracteres."
                    );
        }

        // Verificar correo existente
        if (
            usuarioRepository
                    .findByEmail(usuario.getEmail())
                    .isPresent()
        ) {

            return ResponseEntity.badRequest()
                    .body(
                        "El correo electrónico ya está registrado."
                    );
        }

        // Enviar código
        emailService.enviarCodigoRegistro(
                usuario.getEmail()
        );

        return ResponseEntity.ok(
                "Código enviado al correo electrónico."
        );
    }

    // =========================================================
    // VALIDACIONES SIN EXPRESIONES REGULARES COMPLEJAS
    // =========================================================

    /**
     * Verifica patrones de texto considerados spam.
     */
    private boolean contienePatronSpam(String usuario) {

        String texto = usuario.toLowerCase();

        if (
            texto.contains("asf") ||
            texto.contains("asd") ||
            texto.contains("qwe") ||
            texto.contains("zxc")
        ) {
            return true;
        }

        return contieneCaracterRepetido(texto);
    }

    /**
     * Verifica si un texto contiene tres caracteres consecutivos iguales.
     */
    private boolean contieneCaracterRepetido(String texto) {

        for (int i = 0; i < texto.length() - 2; i++) {

            char actual = texto.charAt(i);

            if (
                texto.charAt(i + 1) == actual &&
                texto.charAt(i + 2) == actual
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica si el texto contiene al menos una vocal.
     */
    private boolean contieneVocal(String texto) {

        String textoMinuscula =
                texto.toLowerCase();

        return textoMinuscula.indexOf('a') >= 0
                || textoMinuscula.indexOf('e') >= 0
                || textoMinuscula.indexOf('i') >= 0
                || textoMinuscula.indexOf('o') >= 0
                || textoMinuscula.indexOf('u') >= 0
                || textoMinuscula.indexOf('á') >= 0
                || textoMinuscula.indexOf('é') >= 0
                || textoMinuscula.indexOf('í') >= 0
                || textoMinuscula.indexOf('ó') >= 0
                || textoMinuscula.indexOf('ú') >= 0;
    }

    /**
     * Verifica que el teléfono tenga el formato colombiano esperado.
     */
    private boolean telefonoColombianoValido(String telefono) {

        if (telefono == null) {
            return false;
        }

        if (!telefono.startsWith("+57 3")) {
            return false;
        }

        String numero = telefono.substring(5);

        if (numero.length() != 8) {
            return false;
        }

        for (int i = 0; i < numero.length(); i++) {

            if (!Character.isDigit(numero.charAt(i))) {
                return false;
            }
        }

        return true;
    }

    // =========================================================
    // REGISTRO - PASO 2
    // =========================================================

    @PostMapping("/verificar-registro")
    public ResponseEntity<?> verificarYGuardar(
            @RequestBody Map<String, Object> payload
    ) {

        String email = (String) payload.get(EMAIL);
        String codigo = (String) payload.get("codigo");

        @SuppressWarnings("unchecked")
        Map<String, String> userData =
                (Map<String, String>) payload.get("usuarioData");

        if (emailService.validarCodigo(email, codigo)) {

            Usuario nuevoUsuario = new Usuario();

            nuevoUsuario.setUsuario(
                    userData.get("usuario")
            );

            nuevoUsuario.setEmail(email);

            nuevoUsuario.setTelefono(
                    userData.get("telefono")
            );

            nuevoUsuario.setPassword(
                    userData.get("password")
            );

            nuevoUsuario.setCuponPrimeraCompra(true);

            // Todo usuario nuevo inicia activo
            nuevoUsuario.setActivo(true);

            // Todo usuario nuevo inicia como CLIENTE
            nuevoUsuario.setRol(ROL_CLIENTE);

            Usuario guardado =
                    usuarioRepository.save(nuevoUsuario);

            return ResponseEntity.ok(guardado);
        }

        return ResponseEntity.status(400)
                .body(
                    "Código de verificación incorrecto."
                );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> loginUsuario(
            @RequestBody Usuario loginRequest
    ) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(
                        loginRequest.getEmail()
                );

        if (!usuarioOpt.isPresent()) {

            usuarioOpt =
                    usuarioRepository.findByUsuario(
                            loginRequest.getEmail()
                    );
        }

        if (usuarioOpt.isPresent()) {

            Usuario usuario = usuarioOpt.get();

            // Verificar contraseña
            if (
                usuario.getPassword().equals(
                    loginRequest.getPassword()
                )
            ) {

                // Verificar estado
                if (
                    usuario.getActivo() != null &&
                    !usuario.getActivo()
                ) {

                    return ResponseEntity.status(403)
                            .body(
                                "Tu cuenta está inactiva. Comunícate con el administrador."
                            );
                }

                return ResponseEntity.ok(usuario);
            }
        }

        return ResponseEntity.status(401)
                .body(
                    "Credenciales incorrectas (Usuario o contraseña inválidos)."
                );
    }

    // =========================================================
    // RECUPERACIÓN DE CONTRASEÑA
    // =========================================================

    @PostMapping("/recuperar-password")
    public ResponseEntity<?> solicitarRecuperacion(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get(EMAIL);

        if (email == null || email.isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(
                        "El correo es obligatorio."
                    );
        }

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(email);

        if (!usuarioOpt.isPresent()) {

            return ResponseEntity.status(404)
                    .body(MENSAJE_ERROR_CORREO);
        }

        try {

            emailService.enviarCodigoRecuperacion(email);

            return ResponseEntity.ok(
                    Map.of(
                        "message",
                        "Código de recuperación enviado al correo."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body(
                        Map.of(
                            "error",
                            "No se pudo enviar el correo de recuperación."
                        )
                    );
        }
    }

    // =========================================================
    // ACTUALIZAR PASSWORD
    // =========================================================

    @PostMapping("/actualizar-password")
    public ResponseEntity<?> actualizarPassword(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get(EMAIL);
        String codigo = request.get("codigo");
        String nuevaPassword =
                request.get("nuevaPassword");

        if (
            nuevaPassword == null ||
            nuevaPassword.length() < 8
        ) {

            return ResponseEntity.badRequest()
                    .body(
                        "La nueva contraseña debe tener al menos 8 caracteres."
                    );
        }

        boolean codigoValido =
                emailService.validarCodigo(
                        email,
                        codigo
                );

        if (!codigoValido) {

            return ResponseEntity.status(400)
                    .body(
                        "Código de verificación incorrecto o expirado."
                    );
        }

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findByEmail(email);

        if (!usuarioOpt.isPresent()) {

            return ResponseEntity.status(404)
                    .body(USUARIO_NO_ENCONTRADO);
        }

        Usuario usuario = usuarioOpt.get();

        usuario.setPassword(nuevaPassword);

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(
                Map.of(
                    "message",
                    "Contraseña actualizada exitosamente."
                )
        );
    }

    // =========================================================
    // ACTUALIZAR PERFIL
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPerfil(
            @PathVariable Long id,
            @RequestBody Usuario datosActualizados
    ) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findById(id);

        if (!usuarioOpt.isPresent()) {

            return ResponseEntity.status(404)
                    .body(USUARIO_NO_ENCONTRADO);
        }

        Usuario usuario = usuarioOpt.get();

        if (
            datosActualizados.getUsuario() != null &&
            !datosActualizados.getUsuario().isBlank()
        ) {

            usuario.setUsuario(
                    datosActualizados.getUsuario()
            );
        }

        if (
            datosActualizados.getEmail() != null &&
            !datosActualizados.getEmail().isBlank()
        ) {

            usuario.setEmail(
                    datosActualizados.getEmail()
            );
        }

        if (
            datosActualizados.getTelefono() != null &&
            !datosActualizados.getTelefono().isBlank()
        ) {

            usuario.setTelefono(
                    datosActualizados.getTelefono()
            );
        }

        if (datosActualizados.getFoto() != null) {

            usuario.setFoto(
                    datosActualizados.getFoto()
            );
        }

        Usuario guardado =
                usuarioRepository.save(usuario);

        return ResponseEntity.ok(guardado);
    }

    // =========================================================
    // ACTIVAR / INACTIVAR USUARIO
    // =========================================================

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> datos
    ) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findById(id);

        if (!usuarioOpt.isPresent()) {

            return ResponseEntity.status(404)
                    .body(USUARIO_NO_ENCONTRADO);
        }

        Boolean activo = datos.get("activo");

        if (activo == null) {

            return ResponseEntity.badRequest()
                    .body(
                        "Debes indicar el estado del usuario."
                    );
        }

        Usuario usuario = usuarioOpt.get();

        usuario.setActivo(activo);

        Usuario guardado =
                usuarioRepository.save(usuario);

        return ResponseEntity.ok(guardado);
    }

    // =========================================================
    // CAMBIAR ROL
    // =========================================================

    @PatchMapping("/{id}/rol")
    public ResponseEntity<?> cambiarRolUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos
    ) {

        Optional<Usuario> usuarioOpt =
                usuarioRepository.findById(id);

        if (!usuarioOpt.isPresent()) {

            return ResponseEntity.status(404)
                    .body(USUARIO_NO_ENCONTRADO);
        }

        String nuevoRol = datos.get("rol");

        if (nuevoRol == null || nuevoRol.isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Debes indicar un rol.");
        }

        nuevoRol = nuevoRol.toUpperCase();

        // Roles permitidos
        if (
            !nuevoRol.equals(ROL_CLIENTE) &&
            !nuevoRol.equals("EMPLEADO") &&
            !nuevoRol.equals("ADMIN")
        ) {

            return ResponseEntity.badRequest()
                    .body(
                        "Rol inválido. Usa CLIENTE, EMPLEADO o ADMIN."
                    );
        }

        Usuario usuario = usuarioOpt.get();

        usuario.setRol(nuevoRol);

        Usuario guardado =
                usuarioRepository.save(usuario);

        return ResponseEntity.ok(guardado);
    }
}