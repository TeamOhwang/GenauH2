package com.project.repository;

import com.project.entity.HydrogenActual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;


@Repository
public interface HydrogenActualRepository extends JpaRepository<HydrogenActual, Long> {

    // 특정 설비의 특정 시간 범위 내 최신 데이터 1건 조회(추가)
    Optional<HydrogenActual> findTopByFacilityIdAndTsBetweenOrderByTsDesc(Long facilityId, LocalDateTime start, LocalDateTime end);    

}