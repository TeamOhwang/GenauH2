package com.project.service;

import com.project.dto.HydrogenTankStatusDTO;
import com.project.repository.RealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HydrogenStorageService {

    private final RealRepository realRepository;

    // 수소 탱크 하나의 용량 (1000kg)
    private static final BigDecimal TANK_CAPACITY_KG = new BigDecimal("1000");

    /**
     * 특정 발전소의 누적 수소 생산량 정보를 조회하고,
     * 현재 수소 탱크 상태를 계산하여 반환합니다.
     *
     * @param plantId 조회할 발전소 ID
     * @return HydrogenTankStatusDTO
     */

     public HydrogenTankStatusDTO getAccumulatedProduction(String plantId) {
        // 1. 조회 기간 설정 (6월 1일부터 현재까지)
        LocalDateTime startDateTime = LocalDateTime.of(LocalDate.now().withMonth(6).withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime endDateTime = LocalDateTime.now();

        // 2. Repository를 통해 해당 기간의 총 수소 생산량(productionKg) 합계 조회
        BigDecimal totalAccumulatedKg = realRepository.sumProductionKgByPlantIdAndTsBetween(plantId, startDateTime, endDateTime);

        // 조회된 데이터가 없을 경우, 0으로 초기화
        if (totalAccumulatedKg == null) {
            totalAccumulatedKg = BigDecimal.ZERO;
        }

        // 3. 꽉 찬 탱크 개수와 현재 탱크에 채워진 양 계산
        long fullTanksCount = 0;
        BigDecimal currentTankLevelKg = BigDecimal.ZERO;

        if (totalAccumulatedKg.compareTo(BigDecimal.ZERO) > 0) {
            // 총 생산량을 탱크 용량으로 나누어 꽉 찬 탱크 개수를 구합니다.
            fullTanksCount = totalAccumulatedKg.divide(TANK_CAPACITY_KG, 0, RoundingMode.FLOOR).longValue();
            // 총 생산량을 탱크 용량으로 나눈 나머지를 구해 현재 탱크의 수소량을 계산합니다.
            currentTankLevelKg = totalAccumulatedKg.remainder(TANK_CAPACITY_KG);
        }

        // 4. DTO에 담아 반환
        return HydrogenTankStatusDTO.builder()
                .totalAccumulatedKg(totalAccumulatedKg)
                .fullTanksCount(fullTanksCount)
                .currentTankLevelKg(currentTankLevelKg)
                .tankCapacityKg(TANK_CAPACITY_KG)
                .build();
    }
    
}
