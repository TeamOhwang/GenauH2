package com.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.repository.PredictRepository;
import com.project.dto.FacilityKpiDto;
import com.project.dto.PredictDTO;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PredictService {

    @Autowired
    private PredictRepository predictRepository;

    /**
     * 모든 facilities에 대한 예측 데이터 생성
     */
    public int generateAllPredictions() {
        return predictRepository.insertPredictionsForAllFacilities();
    }

    /**
     * 특정 facility에 대한 예측 데이터 생성
     */
    public int generatePredictionForFacility(Long facId) {
        return predictRepository.insertPredictionsForFacility(facId);
    }

    /**
     * 특정 날짜/시간에 대한 예측 데이터 생성
     */
    public int generatePredictionByDateTime(String date, Integer hour) {
        // 날짜 형식 검증
        try {
            LocalDateTime.parse(date + "T00:00:00");
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
        }
        
        if (hour < 0 || hour > 23) {
            throw new IllegalArgumentException("Hour must be between 0 and 23");
        }
        
        return predictRepository.insertPredictionsByDateTime(date, hour);
    }

    /**
     * 최신 예측 결과 조회
     */
    @Transactional(readOnly = true)
    public List<PredictDTO> getLatestPredictions() {
        List<Object[]> rawResults = predictRepository.getLatestPredictionsRaw();
        return convertToDto(rawResults);
    }

    /**
     * 특정 facility의 예측 결과 조회
     */
    @Transactional(readOnly = true)
    public List<PredictDTO> getPredictionsForFacility(Long facId) {
        List<Object[]> rawResults = predictRepository.getPredictionsForFacilityRaw(facId);
        return convertToDto(rawResults);
    }

    /**
     * Object[] 결과를 PredictionResult DTO로 변환
     */
    private List<PredictDTO> convertToDto(List<Object[]> rawResults) {
        List<PredictDTO> results = new ArrayList<>();
        
        for (Object[] row : rawResults) {
            PredictDTO result = PredictDTO.builder()
                .predictionid(row[0] != null ? ((Number) row[0]).longValue() : null)
                .facid(row[1] != null ? ((Number) row[1]).longValue() : null)
                .orgid(row[2] != null ? ((Number) row[2]).longValue() : null)
                .plantId(row[3] != null ? row[3].toString() : null)
                .ts(row[4] != null ? ((Timestamp) row[4]).toLocalDateTime() : null)
                .idlepowerkw(row[5] != null ? new BigDecimal(row[5].toString()) : null)
                .predictedmaxkg(row[6] != null ? new BigDecimal(row[6].toString()) : null)
                .predictedcurrentkg(row[7] != null ? new BigDecimal(row[7].toString()) : null)
                .facilityName(row[8] != null ? row[8].toString() : null)
                .plantName(row[9] != null ? row[9].toString() : null)
                .build();
                
            results.add(result);
        }
        
        return results;
    }
    
    @Transactional(readOnly = true)
    public List<PredictDTO> getAllPredictions() {
        List<Object[]> rawResults = predictRepository.getAllPredictionsRaw();
        return convertToDto(rawResults);
    }
    
    @Transactional(readOnly = true)
    public List<PredictDTO> getPredictionsByDateRange(String startDate, String endDate) {
        List<Object[]> rawResults = predictRepository.getPredictionsByDateRange(startDate, endDate);
        return convertToDto(rawResults);
    }
    
    
    /// 사업자 id 기준으로 등록된 설비id 가져오고, 수소생산량, 최대수소생산량 집계합
    @Transactional(readOnly = true)
    public Page<FacilityKpiDto> getFacilityKpis(Long orgId, Pageable pageable) {
    	System.out.println("서비스에 전달된 orgId = " + orgId);
        return predictRepository.findKpiByOrgId(orgId, pageable);
    }
}
    
    
