package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.entity.PlantGeneration;

import java.time.LocalDate;
import java.util.List;

public interface PlantGenerationRepository extends JpaRepository<PlantGeneration, Long> {
    List<PlantGeneration> findByDateBetweenOrderByDateAscHourAsc(LocalDate start, LocalDate end);
    List<PlantGeneration> findByDateBetween(LocalDate start, LocalDate end);
    List<PlantGeneration> findByDateOrderByHourAsc(LocalDate date);
    PlantGeneration findFirstByOrderByDateDescHourDesc();
}