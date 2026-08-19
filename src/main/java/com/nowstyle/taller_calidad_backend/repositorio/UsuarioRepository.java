package com.nowstyle.taller_calidad_backend.repository;

import com.nowstyle.taller_calidad_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Cambia esto para que acepte ambos parámetros
    Optional<Usuario> findByUsuarioAndPassword(String usuario, String password);
    
}