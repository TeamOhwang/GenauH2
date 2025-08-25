package com.project.controller;

import java.time.LocalDate;
import java.util.List;

// 페이징 기능
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dto.DailyTotal;
import com.project.dto.DashboardSummaryDTO;
import com.project.dto.HourlyAvg;
import com.project.dto.PeriodSummaryDTO;
import com.project.dto.HourlyHydrogenProductionDTO;
import com.project.entity.PlantGeneration;
import com.project.service.PlantGenerationQueryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/generation")
@RequiredArgsConstructor
public class PlantGenerationQueryController {
    
    private final PlantGenerationQueryService service;
    
    /** 원시 시계열(엔티티 그대로 반환) */
    @GetMapping("/raw")
    public ResponseEntity<List<PlantGeneration>> getRaw(
            @RequestParam(value = "plantId", required = false) String plantId,
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "2000") int limit) {
        
        System.out.println("=== RAW CONTROLLER ===");
        System.out.println("Received plantId: " + plantId);
        System.out.println("Received startDate: " + startDate);
        System.out.println("Received endDate: " + endDate);
        
        List<PlantGeneration> result = service.getRawSeries(plantId, startDate, endDate, limit);
        return ResponseEntity.ok(result);
    }
    
    /** 최신 1건(엔티티) */
    @GetMapping("/latest")
    public ResponseEntity<PlantGeneration> getLatest(
            @RequestParam(value = "plantId", required = false) String plantId) {
        PlantGeneration latest = service.getLatestEntity(plantId);
        return ResponseEntity.ok(latest);
    }
    
    /** 일별 합계(집계 DTO) */
    @GetMapping("/daily")
    public ResponseEntity<List<DailyTotal>> getDaily(
            @RequestParam(value = "plantId", required = false) String plantId,
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        System.out.println("=== DAILY CONTROLLER ===");
        System.out.println("Received plantId: " + plantId);
        System.out.println("Received startDate: " + startDate);
        System.out.println("Received endDate: " + endDate);
        System.out.println("========================");
        
        List<DailyTotal> result = service.getDaily(plantId, startDate, endDate);
        return ResponseEntity.ok(result);
    }
    
    /** 시간대 평균(집계 DTO) */
    @GetMapping("/hourly-avg")
    public ResponseEntity<List<HourlyAvg>> getHourlyAvg(
            @RequestParam(value = "plantId", required = false) String plantId,
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<HourlyAvg> result = service.getHourlyAvg(plantId, startDate, endDate);
        return ResponseEntity.ok(result);
    }
    
    /** 시간대별 수소 생산량(집계 DTO) */
    @GetMapping("/hourly-hydrogen")
    public ResponseEntity<List<HourlyHydrogenProductionDTO>> getHourlyHydrogenProduction(
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<HourlyHydrogenProductionDTO> result = service.getHourlyHydrogenProduction(startDate, endDate);
        return ResponseEntity.ok(result);
    }
    
    /** 대시보드 요약 정보 */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary(
            @RequestParam(value = "plantId", required = false) String plantId) {
        DashboardSummaryDTO result = service.getDashboardSummary(plantId);
        return ResponseEntity.ok(result);
    }
    
    /** 상세 데이터 (페이징 적용) */
    @GetMapping("/detailed")
    public ResponseEntity<Page<PlantGeneration>> getDetailed(
            @RequestParam(value = "plantId", required = false) String plantId,
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PlantGeneration> result = service.getDetailedData(plantId, startDate, endDate, page, size);
        return ResponseEntity.ok(result);
    }
    
    /** 발전소 목록 조회 */
    @GetMapping("/plant-list")
    public ResponseEntity<List<String>> getPlantList() {
        List<String> result = service.getPlantList();
        return ResponseEntity.ok(result);
    }
    
    /** 특정 기간별 예측량/실제 발전량 합계 */
    @GetMapping("/period-summary")
    public ResponseEntity<PeriodSummaryDTO> getPeriodSummary(
            @RequestParam(value = "plantId", required = false) String plantId,
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        System.out.println("=== PERIOD SUMMARY CONTROLLER ===");
        System.out.println("Received plantId: " + plantId);
        System.out.println("Received startDate: " + startDate);
        System.out.println("Received endDate: " + endDate);
        System.out.println("==================================");
        
        PeriodSummaryDTO result = service.getPeriodSummary(plantId, startDate, endDate);
        return ResponseEntity.ok(result);
    }
}
