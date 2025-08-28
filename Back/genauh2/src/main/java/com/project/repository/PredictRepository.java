package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.project.entity.Predict;

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
    
    
    
    
    
    /// 사업자 id 기준으로 등록된 설비id 가져오고, 수소생산량, 최대수소생산량 집계합
    @Query(value = """
            SELECT 
                t.orgId,
                t.facId,
                t.facilityName,
                t.ts,
                t.totalMaxKg,
                t.totalCurrentKg,
                @cumulativeMax := @cumulativeMax + t.totalMaxKg AS cumulativeMax,
                @cumulativeCurrent := @cumulativeCurrent + t.totalCurrentKg AS cumulativeCurrent
            FROM (
                SELECT 
                    p.orgid AS orgId,
                    p.facid AS facId,
                    f.name AS facilityName,
                    p.ts AS ts,
                    SUM(p.predictedmaxkg) AS totalMaxKg,
                    SUM(p.predictedcurrentkg) AS totalCurrentKg
                FROM production_predict p
                LEFT JOIN facilities f ON p.facid = f.facid
                WHERE p.orgid = :orgId
                AND (:start IS NULL OR p.ts >= :start)
                AND (:end IS NULL OR p.ts <= :end)
                GROUP BY p.orgid, p.facid, f.name, p.ts
                ORDER BY p.ts ASC
            ) t
            CROSS JOIN (SELECT @cumulativeMax := 0, @cumulativeCurrent := 0) vars
            """, nativeQuery = true)
        List<Object[]> sumGetByData(@Param("orgId") Long orgId,
                                    @Param("start") String start,
                                    @Param("end") String end);

    /**
     * 특정 날짜의 모든 예측 유휴 전력량 데이터를 타임스탬프와 함께 조회합니다.
     * @param date 조회할 날짜 (YYYY-MM-DD 형식)
     * @return 타임스탬프(ts), 유휴 전력량(idlepowerkw)을 담은 Object[] 리스트
     */
        @Query(value = "SELECT ts, idlepowerkw FROM production_predict WHERE DATE(ts) = :date ORDER BY ts ASC", nativeQuery = true)
        List<Object[]> findIdlePowerByDate(@Param("date") String date);
    }
    
    
    
