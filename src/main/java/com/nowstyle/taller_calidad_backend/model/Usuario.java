package com.nowstyle.taller_calidad_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    private static final String ROL_CLIENTE = "CLIENTE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario")
    private String nombreUsuario;

    private String email;
    private String telefono;
    private String password;

    private Boolean cuponPrimeraCompra = false;

    // Rol por defecto
    private String rol = ROL_CLIENTE;

    // Estado del usuario
    // true = activo
    // false = inactivo
    private Boolean activo = true;

    // Foto en Base64
    @Lob
    @Column(name = "foto", columnDefinition = "LONGTEXT")
    private String foto;

    // Constructor vacío
    public Usuario() {
        // Constructor requerido por JPA/Hibernate.
    }

    // Constructor sin rol
    public Usuario(
            String nombreUsuario,
            String email,
            String telefono,
            String password
    ) {
        this.nombreUsuario = nombreUsuario;
        this.email = email;
        this.telefono = telefono;
        this.password = password;
        this.rol = ROL_CLIENTE;
        this.activo = true;
    }

    // Constructor completo
    public Usuario(
            String nombreUsuario,
            String email,
            String telefono,
            String password,
            String rol,
            String foto
    ) {
        this.nombreUsuario = nombreUsuario;
        this.email = email;
        this.telefono = telefono;
        this.password = password;
        this.rol = (rol != null && !rol.isBlank()) ? rol : ROL_CLIENTE;
        this.foto = foto;
        this.activo = true;
    }

    // =========================
    // GETTERS Y SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuario() {
        return nombreUsuario;
    }

    public void setUsuario(String usuario) {
        this.nombreUsuario = usuario;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getCuponPrimeraCompra() {
        return cuponPrimeraCompra;
    }

    public void setCuponPrimeraCompra(Boolean cuponPrimeraCompra) {
        this.cuponPrimeraCompra = cuponPrimeraCompra;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
}