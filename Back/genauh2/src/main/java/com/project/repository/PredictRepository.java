package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.project.dto.PredictDTO;
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
            f.h2_rate as idlepowerkw,
            ROUND((f.power_kw - 10) / f.spec_kwh, 3) as predictedmaxkg,
            ROUND((pg.forecast_kwh - 10) / f.spec_kwh, 3) as predictedcurrentkg
        FROM facilities f
        INNER JOIN plant_generation pg ON f.facid = pg.facid
        WHERE f.spec_kwh > 0
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
            f.h2_rate as idlepowerkw,
            ROUND((f.power_kw - 10) / f.spec_kwh, 3) as predictedmaxkg,
            ROUND((pg.forecast_kwh - 10) / f.spec_kwh, 3) as predictedcurrentkg
        FROM facilities f
        INNER JOIN plant_generation pg ON f.facid = pg.facid
        WHERE f.facid = :facId
          AND f.spec_kwh > 0
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
            f.h2_rate as idlepowerkw,
            ROUND((f.power_kw - 10) / f.spec_kwh, 3) as predictedmaxkg,
            ROUND((pg.forecast_kwh - 10) / f.spec_kwh, 3) as predictedcurrentkg
        FROM facilities f
        INNER JOIN plant_generation pg ON f.facid = pg.facid
        WHERE pg.date = :date
          AND pg.hour = :hour
          AND f.spec_kwh > 0
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
}