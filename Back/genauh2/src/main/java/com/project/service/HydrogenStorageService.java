package com.project.service;

import com.project.dto.HydrogenTankStatusDTO;
import com.project.repository.RealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication; // import 추가
import org.springframework.security.core.context.SecurityContextHolder; // import 추가

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.project.dto.HourlyHydrogenProductionDTO;
import com.project.entity.Real;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
    

  /**
 * [최종 해결] 로그인한 사용자가 소유한 모든 발전소의 "오늘" 시간대별 수소 생산량 총합을 조회합니다.
 * (Java Stream을 사용한 안정적인 집계 방식으로 전면 수정)
 * @return 0시부터 23시까지의 시간별 총생산량 DTO 리스트
 */
public List<HourlyHydrogenProductionDTO> getHourlyProductionForToday() {
    // 1. 현재 로그인한 사용자의 orgId 가져오기
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
        throw new SecurityException("인증된 사용자가 아닙니다.");
    }
    String userIdStr = (String) authentication.getPrincipal();
    Long orgId = Long.parseLong(userIdStr);

    // 2. 조회 범위를 "오늘 00:00:00" ~ "내일 00:00:00" (미포함)으로 설정
    LocalDate today = LocalDate.now();
    LocalDateTime startOfToday = today.atStartOfDay();
    LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();

    // 3. Repository를 통해 오늘 하루 동안의 모든 생산량 데이터를 조회
    List<Real> todayProductionData = realRepository.findByOrgidAndTsBetween(orgId, startOfToday, startOfTomorrow);

    // 4. Java Stream을 사용하여 시간대별로 productionKg를 안전하게 그룹화하고 합산합니다.
    Map<Integer, BigDecimal> hourlyHydrogenProductionMap = todayProductionData.stream()
        .filter(data -> data.getProductionKg() != null) // null 값 데이터는 제외
        .collect(Collectors.groupingBy(
            data -> data.getTs().getHour(), // 시간을 기준으로 그룹화
            Collectors.reducing(BigDecimal.ZERO, Real::getProductionKg, BigDecimal::add) // 각 그룹의 productionKg를 합산
        ));

    // 5. 0시부터 23시까지의 전체 DTO 리스트를 생성하여 반환 (데이터가 없는 시간은 0으로 채움)
    return IntStream.range(0, 24)
        .mapToObj(hour -> {
            BigDecimal production = hourlyHydrogenProductionMap.getOrDefault(hour, BigDecimal.ZERO);
            return new HourlyHydrogenProductionDTO(hour, production);
        })
        .sorted(Comparator.comparingInt(HourlyHydrogenProductionDTO::getHour))
        .collect(Collectors.toList());
}


}
