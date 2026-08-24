package com.nowstyle.taller_calidad_backend.controller;

import com.nowstyle.taller_calidad_backend.model.Usuario;
import com.nowstyle.taller_calidad_backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

@PostMapping("/registro")
public ResponseEntity<?> registrarUsuario(@RequestBody Usuario nuevoUsuario) {
    
    // Convertimos la contraseña normal en emojis
    String passwordEnEmojis = encriptarConEmojis(nuevoUsuario.getPassword());
    
    // Se la asignamos al usuario antes de guardarlo en MySQL
    nuevoUsuario.setPassword(passwordEnEmojis);
    
    // Guardamos en la base de datos
    usuarioRepository.save(nuevoUsuario);
    
    return ResponseEntity.ok("Usuario registrado con emojis");
}

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Usuario credenciales) {
    
    // Convertimos también la contraseña que escribe en el login para buscarla igual
    String passwordBuscada = encriptarConEmojis(credenciales.getPassword());
    
Usuario usuarioEncontrado = usuarioRepository.findByUsuarioAndPassword(
        credenciales.getUsuario(), 
        passwordBuscada
    ).orElse(null);
    
    if (usuarioEncontrado != null) {
        return ResponseEntity.ok("Login exitoso");
    } else {
        return ResponseEntity.status(401).body("Credenciales incorrectas");
    }
}
    public String encriptarConEmojis(String password) {
    return password
        .replace("a", "🍎")
        .replace("e", "📦")
        .replace("i", "🔥")
        .replace("o", "🚀")
        .replace("u", "⭐")
        .replace("A", "🍏")
        .replace("E", "📦")
        .replace("I", "💥")
        .replace("O", "🛸")
        .replace("U", "🌟");
}
    
}