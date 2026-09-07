package com.nowstyle.taller_calidad_backend.repository;

import com.nowstyle.taller_calidad_backend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Query("select distinct p from Pedido p left join fetch p.items where p.usuarioEmail = :email order by p.fecha desc")
    List<Pedido> findByUsuarioEmailWithItems(@Param("email") String usuarioEmail);

    @Query("select distinct p from Pedido p left join fetch p.items order by p.fecha desc")
    List<Pedido> findAllWithItems();
}