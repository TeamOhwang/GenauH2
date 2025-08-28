package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import com.project.entity.Real;

import com.project.repository.RealRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.sql.Timestamp; // Timestamp import 추가
import java.util.List;





@Repository
public interface RealRepository extends JpaRepository<Real, Long> {

    @Modifying
    @Query(value = "INSERT INTO production_real (facid, orgid, plant_id, ts, idlepowerkw, productionkg, powerconsumedkwh, utilizationrate) SELECT f.facid, f.orgid, pg.plant_id, CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts, GREATEST(0, ROUND(pg.generation_kw - (pg.capacity_kw * 0.7), 3)) as idlepowerkw, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))) / f.spec_kwh, 3) as productionkg, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))), 2) as powerconsumedkwh, ROUND((pg.generation_kw / pg.capacity_kw) * 100, 4) as utilizationrate FROM facilities f INNER JOIN plant_generation pg ON f.facid = pg.facid WHERE f.spec_kwh > 0 AND pg.capacity_kw > 0 AND pg.hour >= 0 AND pg.hour <= 23", nativeQuery = true)
    int insertProductionRealForAll();

    @Modifying
    @Query(value = "INSERT INTO production_real (facid, orgid, plant_id, ts, idlepowerkw, productionkg, powerconsumedkwh, utilizationrate) SELECT f.facid, f.orgid, pg.plant_id, CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts, GREATEST(0, ROUND(pg.generation_kw - (pg.capacity_kw * 0.7), 3)) as idlepowerkw, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))) / f.spec_kwh, 3) as productionkg, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))), 2) as powerconsumedkwh, ROUND((pg.generation_kw / pg.capacity_kw) * 100, 4) as utilizationrate FROM facilities f INNER JOIN plant_generation pg ON f.facid = pg.facid WHERE f.facid = :facId AND f.spec_kwh > 0 AND pg.capacity_kw > 0 AND pg.hour >= 0 AND pg.hour <= 23", nativeQuery = true)
    int insertProductionRealForFacility(@Param("facId") Long facId);

    @Modifying
    @Query(value = "INSERT INTO production_real (facid, orgid, plant_id, ts, idlepowerkw, productionkg, powerconsumedkwh, utilizationrate) SELECT f.facid, f.orgid, pg.plant_id, CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts, GREATEST(0, ROUND(pg.generation_kw - (pg.capacity_kw * 0.7), 3)) as idlepowerkw, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))) / f.spec_kwh, 3) as productionkg, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))), 2) as powerconsumedkwh, ROUND((pg.generation_kw / pg.capacity_kw) * 100, 4) as utilizationrate FROM facilities f INNER JOIN plant_generation pg ON f.facid = pg.facid WHERE pg.plant_id = :plantId AND f.spec_kwh > 0 AND pg.capacity_kw > 0 AND pg.hour >= 0 AND pg.hour <= 23", nativeQuery = true)
    int insertProductionRealForPlant(@Param("plantId") String plantId);

    @Modifying
    @Query(value = "INSERT INTO production_real (facid, orgid, plant_id, ts, idlepowerkw, productionkg, powerconsumedkwh, utilizationrate) SELECT f.facid, f.orgid, pg.plant_id, CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts, GREATEST(0, ROUND(pg.generation_kw - (pg.capacity_kw * 0.7), 3)) as idlepowerkw, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))) / f.spec_kwh, 3) as productionkg, ROUND((pg.generation_kw - GREATEST(0, pg.generation_kw - (pg.capacity_kw * 0.7))), 2) as powerconsumedkwh, ROUND((pg.generation_kw / pg.capacity_kw) * 100, 4) as utilizationrate FROM facilities f INNER JOIN plant_generation pg ON f.facid = pg.facid WHERE pg.date = :date AND pg.hour = :hour AND f.spec_kwh > 0 AND pg.capacity_kw > 0", nativeQuery = true)
    int insertProductionRealByDateTime(@Param("date") String date, @Param("hour") Integer hour);

    // 가장 오래된 ts 값을 찾는 메서드 추가
    @Query(value = "SELECT MIN(pr.ts) FROM production_real pr", nativeQuery = true)
    Timestamp findFirstTs();
    
    // 특정 기간 내 데이터를 조회하는 메서드 - ASC로 변경
    @Query(value = "SELECT pr.hydrogenactualid, pr.facid, pr.orgid, pr.plant_id, pr.ts, pr.idlepowerkw, pr.productionkg, pr.powerconsumedkwh, pr.utilizationrate, f.name, pg.generation_kw, pg.capacity_kw FROM production_real pr LEFT JOIN facilities f ON pr.facid = f.facid LEFT JOIN plant_generation pg ON pr.plant_id = pg.plant_id AND DATE(pr.ts) = pg.date AND HOUR(pr.ts) = pg.hour WHERE pr.ts BETWEEN :startDate AND :endDate ORDER BY pr.ts ASC, pr.hydrogenactualid ASC", nativeQuery = true)
    List<Object[]> findByTsBetween(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // 최신 100개 데이터 조회 - ASC로 변경 (가장 오래된 100개가 됨)
    @Query(value = "SELECT pr.hydrogenactualid, pr.facid, pr.orgid, pr.plant_id, pr.ts, pr.idlepowerkw, pr.productionkg, pr.powerconsumedkwh, pr.utilizationrate, f.name, pg.generation_kw, pg.capacity_kw FROM production_real pr LEFT JOIN facilities f ON pr.facid = f.facid LEFT JOIN plant_generation pg ON pr.plant_id = pg.plant_id AND DATE(pr.ts) = pg.date AND HOUR(pr.ts) = pg.hour ORDER BY pr.ts ASC, pr.hydrogenactualid ASC LIMIT 100", nativeQuery = true)
    List<Object[]> getLatestProductionRealRaw();

    // 특정 시설 데이터 조회 - ASC로 변경
    @Query(value = "SELECT pr.hydrogenactualid, pr.facid, pr.orgid, pr.plant_id, pr.ts, pr.idlepowerkw, pr.productionkg, pr.powerconsumedkwh, pr.utilizationrate, f.name, pg.generation_kw, pg.capacity_kw FROM production_real pr LEFT JOIN facilities f ON pr.facid = f.facid LEFT JOIN plant_generation pg ON pr.plant_id = pg.plant_id AND DATE(pr.ts) = pg.date AND HOUR(pr.ts) = pg.hour WHERE pr.facid = :facId ORDER BY pr.ts ASC LIMIT 50", nativeQuery = true)
    List<Object[]> getProductionRealForFacilityRaw(@Param("facId") Long facId);

    // 특정 플랜트 데이터 조회 - ASC로 변경
    @Query(value = "SELECT pr.hydrogenactualid, pr.facid, pr.orgid, pr.plant_id, pr.ts, pr.idlepowerkw, pr.productionkg, powerconsumedkwh, pr.utilizationrate, f.name, pg.generation_kw, pg.capacity_kw FROM production_real pr LEFT JOIN facilities f ON pr.facid = f.facid LEFT JOIN plant_generation pg ON pr.plant_id = pg.plant_id AND DATE(pr.ts) = pg.date AND HOUR(pr.ts) = pg.hour WHERE pr.plant_id = :plantId ORDER BY pr.ts ASC LIMIT 50", nativeQuery = true)
    List<Object[]> getProductionRealForPlantRaw(@Param("plantId") String plantId);

    @Modifying
    @Query(value = "DELETE FROM production_real WHERE facid = :facId", nativeQuery = true)
    int deleteProductionRealByFacility(@Param("facId") Long facId);

    @Modifying
    @Query(value = "DELETE FROM production_real WHERE DATE(ts) = :date", nativeQuery = true)
    int deleteProductionRealByDate(@Param("date") String date);

    /**
 * 특정 발전소의 지정된 기간 동안의 총 수소 생산량(productionKg)을 합산하여 반환합니다.
 * @param plantId 발전소 ID
 * @param startDate 시작 일시
 * @param endDate 종료 일시
 * @return 총 수소 생산량 합계
 */
    @Query("SELECT SUM(r.productionKg) FROM Real r WHERE r.plantId = :plantId AND r.ts BETWEEN :startDate AND :endDate")
    BigDecimal sumProductionKgByPlantIdAndTsBetween(
        @Param("plantId") String plantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
);

/**
 * [신규 추가] 특정 조직(orgId)의 지정된 기간 동안의 모든 실제 생산량(Real) 엔티티를 조회합니다.
 * @param orgId 조직 ID
 * @param startDate 시작 일시
 * @param endDate 종료 일시
 * @return Real 엔티티 리스트
 */
List<Real> findByOrgidAndTsBetween(Long orgId, LocalDateTime startDate, LocalDateTime endDate);


/**
 * 특정 날짜의 모든 실제 유휴 전력량 데이터를 타임스탬프와 함께 조회합니다.
 * @param date 조회할 날짜 (YYYY-MM-DD 형식)
 * @return 타임스탬프(ts), 유휴 전력량(idlepowerkw)을 담은 Object[] 리스트
 */
@Query(value = "SELECT ts, idlepowerkw FROM production_real WHERE DATE(ts) = :date ORDER BY ts ASC", nativeQuery = true)
List<Object[]> findIdlePowerByDate(@Param("date") String date);

/**
 * [수정된 부분] 종료 시점을 포함하지 않는 시간 범위로 데이터를 조회하는 메소드 추가
 */
List<Real> findByOrgidAndTsGreaterThanEqualAndTsLessThan(Long orgId, LocalDateTime startDate, LocalDateTime endDate);


}