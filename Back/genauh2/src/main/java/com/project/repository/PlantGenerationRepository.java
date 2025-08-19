package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

// 페이징 기능
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.project.entity.PlantGeneration;

import java.time.LocalDate;
import java.util.List;

public interface PlantGenerationRepository extends JpaRepository<PlantGeneration, Long> {
    List<PlantGeneration> findByDateBetweenOrderByDateAscHourAsc(LocalDate start, LocalDate end);
    List<PlantGeneration> findByDateBetween(LocalDate start, LocalDate end);
    List<PlantGeneration> findByDateOrderByHourAsc(LocalDate date);
    PlantGeneration findFirstByOrderByDateDescHourDesc();

    // 페이징 기능 추가
    Page<PlantGeneration> findByDateBetween(LocalDate start, LocalDate end, Pageable pageable);

}