package com.nowstyle.taller_calidad_backend.repository;

import com.nowstyle.taller_calidad_backend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioEmailOrderByFechaDesc(String usuarioEmail);
    List<Pedido> findAllByOrderByFechaDesc();
}