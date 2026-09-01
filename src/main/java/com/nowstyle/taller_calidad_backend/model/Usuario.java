package com.nowstyle.taller_calidad_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String usuario;
    private String email;
    private String telefono;
    private String password;

    // Se asigna "CLIENTE" por defecto al crear la instancia
    private String rol = "CLIENTE";

    // Campo para guardar la imagen (soporta Base64 largo)
    @Lob
    @Column(name = "foto", columnDefinition = "LONGTEXT")
    private String foto;

    // Constructores
    public Usuario() {}

    // Constructor sin especificar rol
    public Usuario(String usuario, String email, String telefono, String password) {
        this.usuario = usuario;
        this.email = email;
        this.telefono = telefono;
        this.password = password;
        this.rol = "CLIENTE";
    }

    // Constructor completo con rol y foto
    public Usuario(String usuario, String email, String telefono, String password, String rol, String foto) {
        this.usuario = usuario;
        this.email = email;
        this.telefono = telefono;
        this.password = password;
        this.rol = (rol != null && !rol.isBlank()) ? rol : "CLIENTE";
        this.foto = foto;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
}