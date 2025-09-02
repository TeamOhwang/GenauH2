package com.project.repository;

import com.project.entity.HydrogenActual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface HydrogenActualRepository extends JpaRepository<HydrogenActual, Long> {

    // JPQL 쿼리로 명시적으로 작성 (Entity name 사용)
    @Query("SELECT h FROM HydrogenActualEntity h WHERE h.facilityId = :facilityId AND h.ts BETWEEN :start AND :end ORDER BY h.ts DESC")
    Optional<HydrogenActual> findTopByFacilityIdAndTsBetweenOrderByTsDesc(@Param("facilityId") Long facilityId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);    
}