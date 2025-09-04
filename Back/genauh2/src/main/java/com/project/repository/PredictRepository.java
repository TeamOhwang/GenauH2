package com.project.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.dto.FacilityKpiDto;
import com.project.entity.Predict;

@Repository
public interface PredictRepository extends JpaRepository<Predict, String> {

    @Modifying
    @Query(value = """
                INSERT INTO production_predict (
                    facid, orgId, plant_id, ts, idlePowerKw,
                    predictedMaxKg, predictedCurrentKg
                )
                SELECT
                    f.facid,
                    f.orgid,
                    pg.plant_id,
                    CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts,
                    GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3)) as idlePowerKw,
                    ROUND((50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))), 3) as predictedMaxKg,
                    ROUND((CASE
                        WHEN (50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))) > 50
                        THEN (50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))) / 5
                        ELSE 50 / 5
                    END), 3) as predictedCurrentKg
                FROM facilities f
                INNER JOIN plant_generation pg ON f.facid = pg.facid
                WHERE f.spec_kwh > 0 AND f.power_kw > 0 AND pg.capacity_kw > 0
            """, nativeQuery = true)
    int insertPredictionsForAllFacilities();

    @Modifying
    @Query(value = """
                INSERT INTO production_predict (
                    facid, orgId, plant_id, ts, idlePowerKw,
                    predictedMaxKg, predictedCurrentKg
                )
                SELECT
                    f.facid,
                    f.orgid,
                    pg.plant_id,
                    CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts,
                    GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3)) as idlePowerKw,
                    ROUND((50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))), 3) as predictedMaxKg,
                    ROUND((CASE
                        WHEN (50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))) > 50
                        THEN (50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))) / 5
                        ELSE 50 / 5
                    END), 3) as predictedCurrentKg
                FROM facilities f
                INNER JOIN plant_generation pg ON f.facid = pg.facid
                WHERE f.facid = :facId
                  AND f.spec_kwh > 0 AND f.power_kw > 0 AND pg.capacity_kw > 0
            """, nativeQuery = true)
    int insertPredictionsForFacility(@Param("facId") Long facId);

    @Modifying
    @Query(value = """
                INSERT INTO production_predict (
                    facid, orgId, plant_id, ts, idlePowerKw,
                    predictedMaxKg, predictedCurrentKg
                )
                SELECT
                    f.facid,
                    f.orgid,
                    pg.plant_id,
                    CONCAT(pg.date, ' ', LPAD(pg.hour, 2, '0'), ':00:00') as ts,
                    GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3)) as idlePowerKw,
                    ROUND((50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))), 3) as predictedMaxKg,
                    ROUND((CASE
                        WHEN (50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))) > 50
                        THEN (50 + GREATEST(0, ROUND(pg.forecast_kwh - (pg.capacity_kw * 0.3), 3))) / 5
                        ELSE 50 / 5
                    END), 3) as predictedCurrentKg
                FROM facilities f
                INNER JOIN plant_generation pg ON f.facid = pg.facid
                WHERE pg.date = :date
                  AND pg.hour = :hour
                  AND f.spec_kwh > 0 AND f.power_kw > 0 AND pg.capacity_kw > 0
            """, nativeQuery = true)
    int insertPredictionsByDateTime(@Param("date") String date, @Param("hour") Integer hour);

    @Query(value = """
                SELECT
                    p.hydrogenActualId as hydrogenActualId,
                    p.facid as facid,
                    p.orgId as orgId,
                    p.plant_id as plantId,
                    p.ts as ts,
                    p.idlePowerKw as idlePowerKw,
                    p.predictedMaxKg as predictedMaxKg,
                    p.predictedCurrentKg as predictedCurrentKg,
                    f.name as facilityName,
                    p.plant_id as plantName
                FROM production_predict p
                LEFT JOIN facilities f ON p.facid = f.facId
                ORDER BY p.ts ASC, p.hydrogenActualId ASC
                LIMIT 100
            """, nativeQuery = true)
    List<Object[]> getLatestPredictionsRaw();

    @Query(value = """
                SELECT
                    p.hydrogenActualId as hydrogenActualId,
                    p.facid as facid,
                    p.orgId as orgId,
                    p.plant_id as plantId,
                    p.ts as ts,
                    p.idlePowerKw as idlePowerKw,
                    p.predictedMaxKg as predictedMaxKg,
                    p.predictedCurrentKg as predictedCurrentKg,
                    f.name as facilityName,
                    p.plant_id as plantName
                FROM production_predict p
                LEFT JOIN facilities f ON p.facid = f.facId
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

    @Query(value = """
                SELECT
                    p.hydrogenActualId as hydrogenActualId,
                    p.facid as facid,
                    p.orgId as orgId,
                    p.plant_id as plantId,
                    p.ts as ts,
                    p.idlePowerKw as idlePowerKw,
                    p.predictedMaxKg as predictedMaxKg,
                    p.predictedCurrentKg as predictedCurrentKg,
                    f.name as facilityName,
                    p.plant_id as plantName
                FROM production_predict p
                LEFT JOIN facilities f ON p.facid = f.facId
                ORDER BY p.ts ASC, p.hydrogenActualId ASC
            """, nativeQuery = true)
    List<Object[]> getAllPredictionsRaw();

    @Query(value = """
                SELECT
                    p.hydrogenActualId as hydrogenActualId,
                    p.facid as facid,
                    p.orgId as orgId,
                    p.plant_id as plantId,
                    p.ts as ts,
                    p.idlePowerKw as idlePowerKw,
                    p.predictedMaxKg as predictedMaxKg,
                    p.predictedCurrentKg as predictedCurrentKg,
                    f.name as facilityName,
                    p.plant_id as plantName
                FROM production_predict p
                LEFT JOIN facilities f ON p.facid = f.facId
                WHERE DATE(p.ts) BETWEEN :startDate AND :endDate
                ORDER BY p.ts ASC, p.hydrogenActualId ASC
            """, nativeQuery = true)
    List<Object[]> getPredictionsByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    @Query(value = """
            SELECT f.orgId          AS orgId,
                   f.facId          AS facId,
                   f.name           AS facilityName,
                   a.ts             AS ts,
                   COALESCE(a.productionKg, 0)   AS productionKg,
                   COALESCE(a.predictedMaxKg, 0) AS predictedMaxKg
            FROM facilities f
            LEFT JOIN facility_kpi_agg a
                   ON f.facId = a.facId
                  AND a.ts BETWEEN :start AND :end
            WHERE f.orgId = :orgId
            ORDER BY a.ts ASC
            """, nativeQuery = true)
    Page<FacilityKpiDto> findByOrgIdWithName(
            @Param("orgId") Long orgId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    @Query(value = """
            SELECT f.orgId                     AS orgId,
                   f.facId                     AS facId,
                   f.name                      AS facilityName,
                   a.ts                        AS ts,
                   COALESCE(a.productionKg, 0) AS productionKg,
                   COALESCE(a.predictedMaxKg, 0) AS predictedMaxKg
            FROM facilities f
            LEFT JOIN facility_kpi_agg a
                   ON f.facId = a.facId
                  AND a.ts BETWEEN :start AND :end
            WHERE f.orgId = :orgId
              AND f.facId IN (:facIds)
            ORDER BY a.ts ASC
            """, nativeQuery = true)
    List<FacilityKpiDto> findByOrgIdWithNameAndFacIds(
            @Param("orgId") Long orgId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("facIds") List<Long> facIds);

    @Query(value = "SELECT ts, idlePowerKw FROM production_real WHERE DATE(ts) = :date ORDER BY ts ASC", nativeQuery = true)
    List<Object[]> findIdlePowerByDate(@Param("date") String date);

    @Query(value = "SELECT YEAR(p.ts) as year, MONTH(p.ts) as month, (DAYOFMONTH(p.ts) - 1) DIV 7 + 1 as weekOfMonth, SUM(p.predictedCurrentKg) as totalPredict "
            +
            "FROM production_predict p " +
            "WHERE p.orgId = :orgId " +
            "GROUP BY year, month, weekOfMonth " +
            "ORDER BY year, month, weekOfMonth", nativeQuery = true)
    List<Object[]> findWeeklyPredictedByOrgId(@Param("orgId") Long orgId);
}