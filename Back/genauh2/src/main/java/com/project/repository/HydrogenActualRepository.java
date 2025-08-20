package com.project.repository;

import com.project.entity.HydrogenActual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HydrogenActualRepository extends JpaRepository<HydrogenActual, Long> {
}