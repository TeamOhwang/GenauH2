package com.project.alarm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PowerOutputRepository extends JpaRepository<PowerOutputRecord, Long> {

    /**
     * 특정 플랜트의 특정 날짜/시간에 generation_kw <= threshold 인 데이터 조회
     */
    @Query(value = """
        SELECT *
          FROM plant_generation
         WHERE plant_id = :plantId
           AND date = :targetDate
           AND hour = :hourOfDay
           AND generation_kw <= :threshold
         ORDER BY generation_kw ASC
         LIMIT 1
        """, nativeQuery = true)
    List<PowerOutputRecord> findCurrentHourCriticalData(
            @Param("plantId") String plantId,
            @Param("targetDate") LocalDate targetDate,
            @Param("hourOfDay") int hourOfDay,
            @Param("threshold") double threshold
    );

    /**
     * 여러 플랜트를 한번에 체크하는 경우
     */
    @Query(value = """
        SELECT *
          FROM plant_generation
         WHERE date = :targetDate
           AND hour = :hourOfDay
           AND generation_kw <= :threshold
         ORDER BY generation_kw ASC
        """, nativeQuery = true)
    List<PowerOutputRecord> findAllPlantsCurrentHourCriticalData(
            @Param("targetDate") LocalDate targetDate,
            @Param("hourOfDay") int hourOfDay,
            @Param("threshold") double threshold
    );

    /**
     * 기존 메서드 (하위 호환성을 위해 유지)
     * @deprecated 날짜 무시로 인한 부정확한 결과 가능성
     */
    @Deprecated
    @Query(value = """
        SELECT *
          FROM plant_generation
         WHERE hour = :hourOfDay
           AND generation_kw <= :threshold
         ORDER BY date DESC
         LIMIT 1
        """, nativeQuery = true)
    List<PowerOutputRecord> findLatestCriticalByHour(
            @Param("threshold") double threshold,
            @Param("hourOfDay") int hourOfDay
    );
}