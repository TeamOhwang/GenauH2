package com.project.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
// 페이징 기능
import org.springframework.data.domain.Page;

import com.project.dto.DailyTotal;
import com.project.dto.HourlyAvg;
import com.project.dto.DashboardSummaryDTO;
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "2000") int limit) {
        List<PlantGeneration> result = service.getRawSeries(startDate, endDate, limit);
        return ResponseEntity.ok(result);
    }

    /** 최신 1건(엔티티) */
    @GetMapping("/latest")
    public ResponseEntity<PlantGeneration> getLatest() {
        PlantGeneration latest = service.getLatestEntity();
        return ResponseEntity.ok(latest);
    }

    /** 일별 합계(집계 DTO) */
    @GetMapping("/daily")
    public ResponseEntity<List<DailyTotal>> getDaily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DailyTotal> result = service.getDaily(startDate, endDate);
        return ResponseEntity.ok(result);
    }

    /** 시간대 평균(집계 DTO) */
    @GetMapping("/hourly-avg")
    public ResponseEntity<List<HourlyAvg>> getHourlyAvg(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<HourlyAvg> result = service.getHourlyAvg(startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        DashboardSummaryDTO result = service.getDashboardSummary();
        return ResponseEntity.ok(result);
    }

    /* 상세 데이터 (페이징 적용) */
    @GetMapping("/detailed")
    public ResponseEntity<Page<PlantGeneration>> getDetailed(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PlantGeneration> result = service.getDetailedData(startDate, endDate, page, size);
        return ResponseEntity.ok(result);
    }

}