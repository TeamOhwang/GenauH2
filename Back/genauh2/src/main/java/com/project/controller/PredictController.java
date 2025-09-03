package com.project.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.service.PredictService;

import org.springframework.data.domain.Sort;
import com.project.dto.FacilityKpiDto;
import com.project.dto.PredictDTO;
import com.project.dto.WeeklyPredictedDTO;


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
    
    

    /// 사업자 id 기준으로 등록된 설비id 가져오고, 수소생산량, 최대수소생산량 집계합
    @GetMapping("/{orgId}/kpis")
    public Page<FacilityKpiDto> getFacilityKpis(
            @PathVariable Long orgId,
            @RequestParam("start") 
            @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime start,

            @RequestParam("end") 
            @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime end,

            @PageableDefault(size = 20, sort = "ts", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        System.out.println("컨트롤러에 들어온 orgId = " + orgId);
        System.out.println("컨트롤러에 들어온 기간 = " + start + " ~ " + end);

        return predictService.getFacilityKpis(orgId, start, end, pageable);
    }



    /// 사업자 id 기준으로 등록된 단일설비 필터링, 수소생산량, 최대수소생산량 집계합
    @GetMapping("/{orgId}/one")
    public List<FacilityKpiDto> getOneFacilityKpis(
            @PathVariable Long orgId,
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime end,
            @RequestParam("facId") List<Long> facId) {

        // 서비스 호출해서 데이터 조회
        return predictService.getOneFacilityKpis(orgId, start, end, facId);
    }
    
    
    // 특정 조직(org)의 주차별 수소 예측 생산량 합계를 조회합니다.
    @GetMapping("/weekly-production/{orgId}")
    public ResponseEntity<List<WeeklyPredictedDTO>> getWeeklyPredicted(@PathVariable Long orgId) {
    	try {
    		System.out.println("=== WEEKLY PREDICTED CONTROLLER ===");
    		System.out.println("Received orgId: " + orgId);
    		System.out.println("===================================");
    		
    		List<WeeklyPredictedDTO> results = predictService.getWeeklyPredicted(orgId);
    		
    		System.out.println("Service returned " + results.size() + " results");
    		for (int i = 0; i < results.size(); i++) {
    			WeeklyPredictedDTO dto = results.get(i);
    			System.out.println("Result[" + i + "]: " + dto.getYear() + "-" + dto.getMonth() + "-" + dto.getWeekOfMonth() + 
    							   " (" + dto.getWeekLabel() + ") = " + dto.getTotalPredictedKg() + "kg");
    		}
    		
    		return ResponseEntity.ok(results);
    	} catch (Exception e) {
    		System.out.println("Error in getWeeklyPredicted: " + e.getMessage());
    		e.printStackTrace();
    		return ResponseEntity.internalServerError().build();
    	}
    }
 }