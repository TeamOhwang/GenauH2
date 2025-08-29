package com.project.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.project.dto.FacilityKpiDto;
import com.project.dto.PredictDTO;
import com.project.entity.Predict;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictRepository extends JpaRepository<Predict, String> {


    @Modifying
    @Query(value = """
        INSERT INTO production_predict (
            facid, orgid, plant_id, ts, idlepowerkw, 
            predictedmaxkg, predictedcurrentkg
        )
        SELECT 
            f.facid,
            f.orgid,
            pg.plant_id,
            CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts,
            GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3)) as idlepowerkw,
            ROUND((50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3))), 3) as predictedmaxkg,
            ROUND((GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3)) * (0.75 + (RAND() * 0.05)) + 50), 3) as predictedcurrentkg
        FROM facilities f
        INNER JOIN plant_generation pg ON f.facid = pg.facid
        WHERE f.spec_kwh > 0 AND f.power_kw > 0 AND pg.capacity_kw > 0
    """, nativeQuery = true)
    int insertPredictionsForAllFacilities();

    @Modifying
    @Query(value = """
        INSERT INTO production_predict (
            facid, orgid, plant_id, ts, idlepowerkw, 
            predictedmaxkg, predictedcurrentkg
        )
        SELECT 
            f.facid,
            f.orgid,
            pg.plant_id,
            CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts,
            GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3)) as idlepowerkw,
            ROUND((50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3))), 3) as predictedmaxkg,
            ROUND((GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3)) * (0.75 + (RAND() * 0.05)) + 50), 3) as predictedcurrentkg
        FROM facilities f
        INNER JOIN plant_generation pg ON f.facid = pg.facid
        WHERE f.facid = :facId
          AND f.spec_kwh > 0 AND f.power_kw > 0 AND pg.capacity_kw > 0
    """, nativeQuery = true)
    int insertPredictionsForFacility(@Param("facId") Long facId);

    @Modifying
    @Query(value = """
        INSERT INTO production_predict (
            facid, orgid, plant_id, ts, idlepowerkw, 
            predictedmaxkg, predictedcurrentkg
        )
        SELECT 
            f.facid,
            f.orgid,
            pg.plant_id,
            CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts,
            GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3)) as idlepowerkw,
            ROUND((50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3))), 3) as predictedmaxkg,
            ROUND((GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.7), 3)) * (0.75 + (RAND() * 0.05)) + 50), 3) as predictedcurrentkg
        FROM facilities f
        INNER JOIN plant_generation pg ON f.facid = pg.facid
        WHERE pg.date = :date
          AND pg.hour = :hour
          AND f.spec_kwh > 0 AND f.power_kw > 0 AND pg.capacity_kw > 0
    """, nativeQuery = true)
    int insertPredictionsByDateTime(@Param("date") String date, @Param("hour") Integer hour);

    // 잘못된 JOIN 수정 및 ASC 정렬로 변경
    @Query(value = """
        SELECT 
            p.predictionid as predictionid,
            p.facid as facid,
            p.orgid as orgid,
            p.plant_id as plantId,
            p.ts as ts,
            p.idlepowerkw as idlepowerkw,
            p.predictedmaxkg as predictedmaxkg,
            p.predictedcurrentkg as predictedcurrentkg,
            f.name as facilityName,
            p.plant_id as plantName
        FROM production_predict p
        LEFT JOIN facilities f ON p.facid = f.facid
        ORDER BY p.ts ASC, p.predictionid ASC
        LIMIT 100
    """, nativeQuery = true)
    List<Object[]> getLatestPredictionsRaw();

    // 잘못된 JOIN 수정 및 ASC 정렬로 변경
    @Query(value = """
        SELECT 
            p.predictionid as predictionid,
            p.facid as facid,
            p.orgid as orgid,
            p.plant_id as plantId,
            p.ts as ts,
            p.idlepowerkw as idlepowerkw,
            p.predictedmaxkg as predictedmaxkg,
            p.predictedcurrentkg as predictedcurrentkg,
            f.name as facilityName,
            p.plant_id as plantName
        FROM production_predict p
        LEFT JOIN facilities f ON p.facid = f.facid
        WHERE p.facid = :facId
        ORDER BY p.ts ASC
        LIMIT 50
    """, nativeQuery = true)
    List<Object[]> getPredictionsForFacilityRaw(@Param("facId") Long facId);

    @Modifying
    @Query(value = "DELETE FROM production_predict WHERE facid = :facId", nativeQuery = true)
    int deletePredictionsByFacility(@Param("facId") Long facId);

    @Modifying
    @Query(value = "DELETE FROM production_predict WHERE DATE(ts) = :date", nativeQuery = true)
    int deletePredictionsByDate(@Param("date") String date);
    
    // 모든 예측 데이터 조회
    @Query(value = """
        SELECT 
            p.predictionid as predictionid,
            p.facid as facid,
            p.orgid as orgid,
            p.plant_id as plantId,
            p.ts as ts,
            p.idlepowerkw as idlepowerkw,
            p.predictedmaxkg as predictedmaxkg,
            p.predictedcurrentkg as predictedcurrentkg,
            f.name as facilityName,
            p.plant_id as plantName
        FROM production_predict p
        LEFT JOIN facilities f ON p.facid = f.facid
        ORDER BY p.ts ASC, p.predictionid ASC
    """, nativeQuery = true)
    List<Object[]> getAllPredictionsRaw();
;
    // 특정 기간 예측 데이터 조회
    @Query(value = """
        SELECT 
            p.predictionid as predictionid,
            p.facid as facid,
            p.orgid as orgid,
            p.plant_id as plantId,
            p.ts as ts,
            p.idlepowerkw as idlepowerkw,
            p.predictedmaxkg as predictedmaxkg,
            p.predictedcurrentkg as predictedcurrentkg,
            f.name as facilityName,
            p.plant_id as plantName
        FROM production_predict p
        LEFT JOIN facilities f ON p.facid = f.facid
        WHERE p.ts BETWEEN :startDate AND :endDate
        ORDER BY p.ts ASC, p.predictionid ASC
    """, nativeQuery = true)
    List<Object[]> getPredictionsByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);
    
    
    List<Object[]> findIdlePowerByDate(String dateString);
    
    

    /// 사업자 id 기준으로 등록된 설비 + 예측/실제 생산량 집계합 (페이지네이션 지원)
    @Query(
        value = """
            SELECT 
                o.orgId        AS orgId,
                f.facId        AS facId,
                f.name         AS facilityName,
                COALESCE(r.ts, p.ts) AS ts,
                COALESCE(r.productionKg, 0)   AS productionKg,
                COALESCE(p.predictedMaxKg, 0) AS predictedMaxKg
            FROM organizations o
            JOIN facilities f 
                ON o.orgId = f.orgId
            JOIN plant_generation pg 
                ON f.facId = pg.facId
            LEFT JOIN (
                SELECT plant_id, ts, SUM(productionKg) AS productionKg
                FROM production_real
                GROUP BY plant_id, ts
            ) r
                ON pg.plant_id = r.plant_id
            LEFT JOIN (
                SELECT plant_id, ts, SUM(predictedMaxKg) AS predictedMaxKg
                FROM production_predict
                GROUP BY plant_id, ts
            ) p
                ON pg.plant_id = p.plant_id AND r.ts = p.ts
            WHERE o.orgId = :orgId
            ORDER BY ts ASC
            /*#pageable*/
            """,
        countQuery = """
            SELECT COUNT(*)
            FROM (
                SELECT COALESCE(r.ts, p.ts) AS ts, f.facId
                FROM organizations o
                JOIN facilities f 
                    ON o.orgId = f.orgId
                JOIN plant_generation pg 
                    ON f.facId = pg.facId
                LEFT JOIN (
                    SELECT plant_id, ts
                    FROM production_real
                    GROUP BY plant_id, ts
                ) r
                    ON pg.plant_id = r.plant_id
                LEFT JOIN (
                    SELECT plant_id, ts
                    FROM production_predict
                    GROUP BY plant_id, ts
                ) p
                    ON pg.plant_id = p.plant_id AND r.ts = p.ts
                WHERE o.orgId = :orgId
                GROUP BY f.facId, ts
            ) sub
            """,
        nativeQuery = true
    )
    Page<FacilityKpiDto> findKpiByOrgId(
            @Param("orgId") Long orgId,
            Pageable pageable
    );
}