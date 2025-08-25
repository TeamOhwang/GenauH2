package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
// 페이징 기능
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.project.entity.PlantGeneration;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlantGenerationRepository extends JpaRepository<PlantGeneration, Long> {
    
    // 특정 발전소의 데이터 조회
    List<PlantGeneration> findByPlantIdAndDateBetweenOrderByDateAscHourAsc(String plantId, LocalDate start, LocalDate end);
    List<PlantGeneration> findByPlantIdAndDateBetween(String plantId, LocalDate start, LocalDate end);
    List<PlantGeneration> findByPlantIdAndDateOrderByHourAsc(String plantId, LocalDate date);
    PlantGeneration findFirstByPlantIdOrderByDateDescHourDesc(String plantId);
    
    // 전체 발전소 데이터 조회 (기존 메서드 유지)
    List<PlantGeneration> findByDateBetweenOrderByDateAscHourAsc(LocalDate start, LocalDate end);
    List<PlantGeneration> findByDateBetween(LocalDate start, LocalDate end);
    List<PlantGeneration> findByDateOrderByHourAsc(LocalDate date);
    PlantGeneration findFirstByOrderByDateDescHourDesc();

    // 페이징 기능 - 특정 발전소
    Page<PlantGeneration> findByPlantIdAndDateBetween(String plantId, LocalDate start, LocalDate end, Pageable pageable);
    
    // 페이징 기능 - 전체 발전소
    Page<PlantGeneration> findByDateBetween(LocalDate start, LocalDate end, Pageable pageable);

    // 발전소 ID 목록 조회
    List<String> findDistinctPlantIdByOrderByPlantIdAsc();
}