package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.model.Usuario;
import com.nowstyle.taller_calidad_backend.repository.UsuarioRepository;
import com.nowstyle.taller_calidad_backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    // Obtener un usuario por ID (para actualizar el frontend al cargar la app)
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (!usuarioOpt.isPresent()) {
            return ResponseEntity.status(404).body("Usuario no encontrado.");
        }
        return ResponseEntity.ok(usuarioOpt.get());
    }

    // Paso 1: Valida los datos y genera el código de verificación en la consola de Java
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        
        // Validar usuario contra spam obvio
        if (usuario.getUsuario() == null || usuario.getUsuario().length() < 4 || usuario.getUsuario().matches("(?i).*(asf|asd|qwe|zxc|\\b(.)\\1{2,}\\b).*")) {
            return ResponseEntity.badRequest().body("El nombre de usuario no es válido o parece spam.");
        }
        
        // Validar correo gmail estricto
        if (usuario.getEmail() == null || !usuario.getEmail().toLowerCase().endsWith("@gmail.com")) {
            return ResponseEntity.badRequest().body("El correo debe ser strictly una cuenta @gmail.com.");
        }

        String usernameEmail = usuario.getEmail().toLowerCase().split("@")[0];
        if (usernameEmail.length() < 4 || !usernameEmail.matches(".*[aeiouáéíóú].*") || usernameEmail.matches(".*(.)\\1{2,}.*")) {
            return ResponseEntity.badRequest().body("Por favor ingresa un correo de Gmail real y válido.");
        }

        // Validar teléfono colombiano (+57 3XXXXXXXXX)
        if (usuario.getTelefono() == null || !usuario.getTelefono().matches("^\\+57 3\\d{9}$")) {
            return ResponseEntity.badRequest().body("El número de teléfono debe ser válido para Colombia (+57 3XXXXXXXXX).");
        }

        // Validar contraseña
        if (usuario.getPassword() == null || usuario.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body("La contraseña debe tener al menos 8 caracteres.");
        }

        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("El correo electrónico ya está registrado.");
        }

        // Si pasa todas las validaciones, generamos y enviamos el correo real por SMTP
        emailService.enviarCodigoRegistro(usuario.getEmail());

        return ResponseEntity.ok("Código enviado al correo electrónico.");
    }

    // Paso 2: Valida el código ingresado en el frontend y guarda en la base de datos
    @PostMapping("/verificar-registro")
    public ResponseEntity<?> verificarYGuardar(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String codigo = (String) payload.get("codigo");
        Map<String, String> userData = (Map<String, String>) payload.get("usuarioData");

        if (emailService.validarCodigo(email, codigo)) {
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsuario(userData.get("usuario"));
            nuevoUsuario.setEmail(email);
            nuevoUsuario.setTelefono(userData.get("telefono"));
            nuevoUsuario.setPassword(userData.get("password"));

            Usuario guardado = usuarioRepository.save(nuevoUsuario);
            return ResponseEntity.ok(guardado);
        }

        return ResponseEntity.status(400).body("Código de verificación incorrecto.");
    }

    // Endpoint de Login
    @PostMapping("/login")
    public ResponseEntity<?> loginUsuario(@RequestBody Usuario loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(loginRequest.getEmail());
        if (!usuarioOpt.isPresent()) {
            usuarioOpt = usuarioRepository.findByUsuario(loginRequest.getEmail());
        }

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(usuario);
            }
        }
        return ResponseEntity.status(401).body("Credenciales incorrectas (Usuario o contraseña inválidos).");
    }

    // --- ENDPOINTS PARA RECUPERACIÓN DE CONTRASEÑA ---

    @PostMapping("/recuperar-password")
    public ResponseEntity<?> solicitarRecuperacion(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("El correo es obligatorio.");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (!usuarioOpt.isPresent()) {
            return ResponseEntity.status(404).body("El correo electrónico no está asociado a ninguna cuenta.");
        }

        try {
            emailService.enviarCodigoRecuperacion(email);
            return ResponseEntity.ok(Map.of("message", "Código de recuperación enviado al correo."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "No se pudo enviar el correo de recuperación."));
        }
    }

    @PostMapping("/actualizar-password")
    public ResponseEntity<?> actualizarPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String codigo = request.get("codigo");
        String nuevaPassword = request.get("nuevaPassword");

        if (nuevaPassword == null || nuevaPassword.length() < 8) {
            return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 8 caracteres.");
        }

        boolean codigoValido = emailService.validarCodigo(email, codigo);
        if (!codigoValido) {
            return ResponseEntity.status(400).body("Código de verificación incorrecto o expirado.");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (!usuarioOpt.isPresent()) {
            return ResponseEntity.status(404).body("Usuario no encontrado.");
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setPassword(nuevaPassword);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente."));
    }

    // Endpoint para actualizar datos del perfil (incluye la foto en Base64)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPerfil(@PathVariable Long id, @RequestBody Usuario datosActualizados) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        
        if (!usuarioOpt.isPresent()) {
            return ResponseEntity.status(404).body("Usuario no encontrado.");
        }

        Usuario usuario = usuarioOpt.get();
        
        if (datosActualizados.getUsuario() != null && !datosActualizados.getUsuario().isBlank()) {
            usuario.setUsuario(datosActualizados.getUsuario());
        }
        if (datosActualizados.getEmail() != null && !datosActualizados.getEmail().isBlank()) {
            usuario.setEmail(datosActualizados.getEmail());
        }
        if (datosActualizados.getTelefono() != null && !datosActualizados.getTelefono().isBlank()) {
            usuario.setTelefono(datosActualizados.getTelefono());
        }
        // Actualizar el campo foto si viene en la petición
        if (datosActualizados.getFoto() != null) {
            usuario.setFoto(datosActualizados.getFoto());
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(guardado);
    }
}