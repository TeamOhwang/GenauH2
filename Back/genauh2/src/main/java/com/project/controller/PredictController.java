package com.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.service.PredictService;
import com.project.dto.FacilityKpiDto;
import com.project.dto.PredictDTO;

@RestController
@RequestMapping("/predict")
public class PredictController {

    @Autowired
    private PredictService predictService;

    /**
     * 모든 facilities에 대한 예측 데이터를 생성하고 저장
     */
    @PostMapping("/generate-all")
    public ResponseEntity<String> generateAllPredictions() {
        try {
            int insertedCount = predictService.generateAllPredictions();
            return ResponseEntity.ok("Successfully generated " + insertedCount + " prediction records");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating predictions: " + e.getMessage());
        }
    }

    /**
     * 특정 facility에 대한 예측 데이터를 생성하고 저장
     */
    @PostMapping("/generate/{facId}")
    public ResponseEntity<String> generatePredictionForFacility(@PathVariable Long facId) {
        try {
            int insertedCount = predictService.generatePredictionForFacility(facId);
            return ResponseEntity.ok("Successfully generated " + insertedCount + " prediction records for facility " + facId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating prediction for facility " + facId + ": " + e.getMessage());
        }
    }

    /**
     * 특정 날짜와 시간에 대한 예측 데이터를 생성하고 저장
     */
    @PostMapping("/generate-by-datetime")
    public ResponseEntity<String> generatePredictionByDateTime(
            @RequestParam String date, 
            @RequestParam Integer hour) {
        try {
            int insertedCount = predictService.generatePredictionByDateTime(date, hour);
            return ResponseEntity.ok("Successfully generated " + insertedCount + " prediction records for " + date + " " + hour + ":00");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error generating prediction: " + e.getMessage());
        }
    }

    /**
     * 예측 결과 조회 (최신 데이터)
     */
    @GetMapping("/results")
    public ResponseEntity<List<PredictDTO>> getPredictionResults() {
        try {
            List<PredictDTO> results = predictService.getLatestPredictions();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 facility의 예측 결과 조회
     */
    @GetMapping("/results/{facId}")
    public ResponseEntity<List<PredictDTO>> getPredictionResultsForFacility(@PathVariable Long facId) {
        try {
            List<PredictDTO> results = predictService.getPredictionsForFacility(facId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<PredictDTO>> getAllPredictions() {
        try {
            List<PredictDTO> predictions = predictService.getAllPredictions();
            return ResponseEntity.ok(predictions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/range")
    public ResponseEntity<List<PredictDTO>> getPredictionsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            List<PredictDTO> predictions = predictService.getPredictionsByDateRange(startDate, endDate);
            return ResponseEntity.ok(predictions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    
    
    ////// 사업자 id 기준 KPI 조회 + 페이지네이션
    @GetMapping("/{orgId}/kpis")
    public Page<FacilityKpiDto> getFacilityKpis(
            @PathVariable Long orgId,
            @PageableDefault(size = 20, sort = "ts") Pageable pageable
    ) {
    	System.out.println("컨트롤러에 들어온 orgId = " + orgId);
        return predictService.getFacilityKpis(orgId, pageable);
    }
}
    
    
    
    
    
     
