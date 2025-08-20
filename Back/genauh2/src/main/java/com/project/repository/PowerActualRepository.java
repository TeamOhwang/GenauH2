package com.project.repository;

import com.project.entity.PowerActual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PowerActualRepository extends JpaRepository<PowerActual, Long> {
}