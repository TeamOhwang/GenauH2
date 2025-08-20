package com.project.repository;

import com.project.entity.ProductionPredicted;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductionPredictedRepository extends JpaRepository<ProductionPredicted, Long> {
}