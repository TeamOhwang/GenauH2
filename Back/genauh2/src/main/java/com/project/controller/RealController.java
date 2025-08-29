package com.project.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.project.service.RealService;
import com.project.dto.HourlyProductionDTO;
import com.project.dto.RealDTO;

@RestController
@RequestMapping("/real")
public class RealController {

    @Autowired
    private RealService realService;

    /**
     * 모든 plant_generation 데이터에 대한 실제 생산 데이터를 생성하고 저장
     */
    @PostMapping("/generate-all")
    public ResponseEntity<String> generateAllProductionReal() {
        try {
            int insertedCount = realService.generateAllProductionReal();
            return ResponseEntity.ok("Successfully generated " + insertedCount + " production real records");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating production real data: " + e.getMessage());
        }
    }

    /**
     * 특정 facility에 대한 실제 생산 데이터를 생성하고 저장
     */
    @PostMapping("/generate/{facId}")
    public ResponseEntity<String> generateProductionRealForFacility(@PathVariable Long facId) {
        try {
            int insertedCount = realService.generateProductionRealForFacility(facId);
            return ResponseEntity.ok("Successfully generated " + insertedCount + " production real records for facility " + facId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating production real data for facility " + facId + ": " + e.getMessage());
        }
    }

    /**
     * 특정 plant에 대한 실제 생산 데이터를 생성하고 저장
     */
    @PostMapping("/generate-plant/{plantId}")
    public ResponseEntity<String> generateProductionRealForPlant(@PathVariable String plantId) {
        try {
            int insertedCount = realService.generateProductionRealForPlant(plantId);
            return ResponseEntity.ok("Successfully generated " + insertedCount + " production real records for plant " + plantId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating production real data for plant " + plantId + ": " + e.getMessage());
        }
    }

    /**
     * 특정 날짜와 시간에 대한 실제 생산 데이터를 생성하고 저장
     */
    @PostMapping("/generate-by-datetime")
    public ResponseEntity<String> generateProductionRealByDateTime(
            @RequestParam String date, 
            @RequestParam Integer hour) {
        try {
            int insertedCount = realService.generateProductionRealByDateTime(date, hour);
            return ResponseEntity.ok("Successfully generated " + insertedCount + " production real records for " + date + " " + hour + ":00");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating production real data: " + e.getMessage());
        }
    }

    /**
     * 실제 생산 결과 조회 (최신 데이터)
     */
    @GetMapping("/results")
    public ResponseEntity<List<RealDTO>> getProductionRealResults() {
        try {
            List<RealDTO> results = realService.getLatestProductionReal();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 모든 실제 생산 결과 조회
     */
    @GetMapping("/all")
    public ResponseEntity<List<RealDTO>> getAllProductionRealResults() {
        try {
            List<RealDTO> results = realService.getAllProductionReal();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 facility의 실제 생산 결과 조회
     */
    @GetMapping("/results/{facId}")
    public ResponseEntity<List<RealDTO>> getProductionRealResultsForFacility(@PathVariable Long facId) {
        try {
            List<RealDTO> results = realService.getProductionRealForFacility(facId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 plant의 실제 생산 결과 조회
     */
    @GetMapping("/results-plant/{plantId}")
    public ResponseEntity<List<RealDTO>> getProductionRealResultsForPlant(@PathVariable String plantId) {
        try {
            List<RealDTO> results = realService.getProductionRealForPlant(plantId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 기간 내의 실제 생산 결과를 조회 (startDate, endDate 선택 사항)
     */
    @GetMapping("/range")
    public ResponseEntity<List<RealDTO>> getProductionRealByDateRange(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        try {
            List<RealDTO> results = realService.getProductionRealByDateRange(startDate, endDate);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/hourly-production/{orgId}")
    public ResponseEntity<List<HourlyProductionDTO>> getHourlyProduction(@PathVariable Long orgId) {
        try {
            List<HourlyProductionDTO> results = realService.getHourlyProduction(orgId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/six-month-production/{orgId}")
    public ResponseEntity<BigDecimal> getSixMonthProduction(@PathVariable Long orgId) {
        try {
            BigDecimal result = realService.getSixMonthProduction(orgId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/total-production/{orgId}")
    public ResponseEntity<BigDecimal> getTotalProduction(@PathVariable Long orgId) {
        try {
            BigDecimal result = realService.getTotalProduction(orgId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
