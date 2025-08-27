package com.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.repository.RealRepository;
import com.project.dto.RealDTO;
import com.project.entity.Real;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class RealService {

    @Autowired
    private RealRepository realRepository;

    /**
     * 모든 plant_generation 데이터에 대한 실제 생산 데이터 생성
     */
    public int generateAllProductionReal() {
        return realRepository.insertProductionRealForAll();
    }

    /**
     * 특정 facility에 대한 실제 생산 데이터 생성
     */
    public int generateProductionRealForFacility(Long facId) {
        return realRepository.insertProductionRealForFacility(facId);
    }

    /**
     * 특정 plant에 대한 실제 생산 데이터 생성
     */
    public int generateProductionRealForPlant(String plantId) {
        return realRepository.insertProductionRealForPlant(plantId);
    }

    /**
     * 특정 날짜/시간에 대한 실제 생산 데이터 생성
     */
    public int generateProductionRealByDateTime(String date, Integer hour) {
        // 날짜 형식 검증
        try {
            LocalDateTime.parse(date + "T00:00:00");
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
        }
        
        if (hour < 0 || hour > 23) {
            throw new IllegalArgumentException("Hour must be between 0 and 23");
        }
        
        return realRepository.insertProductionRealByDateTime(date, hour);
    }
    
    /**
     * 모든 실제 생산 데이터를 조회
     * @return 모든 RealDTO 객체 리스트
     */
    @Transactional(readOnly = true)
    public List<RealDTO> getAllProductionReal() {
        try {
            // RealRepository에서 Real 엔티티 리스트를 가져온다.
            // JpaRepository의 findAll() 메서드는 엔티티 리스트를 반환한다.
            List<Real> realEntities = realRepository.findAll();
            
            // 가져온 Real 엔티티 리스트를 RealDTO 객체 리스트로 변환한다.
            return convertToDtoFromRealEntities(realEntities);
        } catch (Exception e) {
            // 예외 발생 시 로그를 남기고 빈 리스트 반환
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 최신 실제 생산 결과 조회
     */
    @Transactional(readOnly = true)
    public List<RealDTO> getLatestProductionReal() {
        List<Object[]> rawResults = realRepository.getLatestProductionRealRaw();
        return convertToDto(rawResults);
    }

    /**
     * 특정 facility의 실제 생산 결과 조회
     */
    @Transactional(readOnly = true)
    public List<RealDTO> getProductionRealForFacility(Long facId) {
        List<Object[]> rawResults = realRepository.getProductionRealForFacilityRaw(facId);
        return convertToDto(rawResults);
    }

    /**
     * 특정 plant의 실제 생산 결과 조회
     */
    @Transactional(readOnly = true)
    public List<RealDTO> getProductionRealForPlant(String plantId) {
        List<Object[]> rawResults = realRepository.getProductionRealForPlantRaw(plantId);
        return convertToDto(rawResults);
    }

    /**
     * 특정 기간 내의 실제 생산 결과를 조회
     * startDate와 endDate가 null이면 자동으로 DB의 첫 데이터부터 현재까지의 데이터를 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<RealDTO> getProductionRealByDateRange(String startDate, String endDate) {
        
        // startDate가 없으면 DB에서 가장 오래된 데이터를 찾습니다.
        String finalStartDate = startDate;
        if (startDate == null || startDate.isEmpty()) {
            Timestamp firstTs = realRepository.findFirstTs();
            if (firstTs != null) {
                finalStartDate = firstTs.toLocalDateTime().toString();
            } else {
                // 데이터가 없는 경우, 현재 시간을 시작 날짜로 설정
                finalStartDate = LocalDateTime.now().toString();
            }
        }
        
        // endDate가 없으면 현재 시간을 사용합니다.
        String finalEndDate = endDate;
        if (endDate == null || endDate.isEmpty()) {
            finalEndDate = LocalDateTime.now().toString();
        }

        List<Object[]> rawResults = realRepository.findByTsBetween(finalStartDate, finalEndDate);
        return convertToDto(rawResults);
    }

    /**
     * Object[] 결과를 RealDTO로 변환
     */
    private List<RealDTO> convertToDto(List<Object[]> rawResults) {
        List<RealDTO> results = new ArrayList<>();
        
        for (Object[] row : rawResults) {
            RealDTO result = RealDTO.builder()
                .hydrogenActualId(row[0] != null ? ((Number) row[0]).longValue() : null)
                .facid(row[1] != null ? ((Number) row[1]).longValue() : null)
                .orgid(row[2] != null ? ((Number) row[2]).longValue() : null)
                .plantId(row[3] != null ? row[3].toString() : null)
                .ts(row[4] != null ? ((Timestamp) row[4]).toLocalDateTime() : null)
                .idlepowerkw(row[5] != null ? new BigDecimal(row[5].toString()) : null)
                .productionKg(row[6] != null ? new BigDecimal(row[6].toString()) : null)
                .powerConsumedKwh(row[7] != null ? new BigDecimal(row[7].toString()) : null)
                .utilizationRate(row[8] != null ? new BigDecimal(row[8].toString()) : null)
                .facilityName(row[9] != null ? row[9].toString() : null)
                .plantName(null)
                .generationKw(row[10] != null ? new BigDecimal(row[10].toString()) : null)
                .capacityKw(row[11] != null ? new BigDecimal(row[11].toString()) : null)
                .build();
            
            results.add(result);
        }
        
        return results;
    }

    /**
     * Real 엔티티 결과를 RealDTO로 변환
     */
    private List<RealDTO> convertToDtoFromRealEntities(List<Real> realEntities) {
        List<RealDTO> results = new ArrayList<>();
        
        for (Real real : realEntities) {
            RealDTO result = RealDTO.builder()
                .hydrogenActualId(real.getHydrogenActualId())
                .facid(real.getFacid())
                .orgid(real.getOrgid())
                .plantId(real.getPlantId())
                .ts(real.getTs())
                .idlepowerkw(real.getIdlepowerkw())
                .productionKg(real.getProductionKg())
                .powerConsumedKwh(real.getPowerConsumedKwh())
                .utilizationRate(real.getUtilizationRate())
                .build();
            
            results.add(result);
        }
        
        return results;
    }
}
