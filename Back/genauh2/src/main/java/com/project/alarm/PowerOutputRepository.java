package com.project.alarm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PowerOutputRepository extends JpaRepository<PowerOutputRecord, Long> {

    /**
     * 날짜는 무시하고 hour만 현재 시와 같으며 generation_kw <= :threshold 인 행 중
     * 가장 최근 날짜 1건만 조회.
     */
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
