package com.nowstyle.taller_calidad_backend.repository;

import com.nowstyle.taller_calidad_backend.model.MensajePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MensajePedidoRepository extends JpaRepository<MensajePedido, Long> {
    List<MensajePedido> findByPedidoIdOrderByFechaAsc(Long pedidoId);
}