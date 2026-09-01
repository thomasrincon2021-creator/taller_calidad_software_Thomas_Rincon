package com.nowstyle.taller_calidad_backend.repository;

import com.nowstyle.taller_calidad_backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}