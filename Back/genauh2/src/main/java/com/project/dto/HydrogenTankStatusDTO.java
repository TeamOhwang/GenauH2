package com.project.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class HydrogenTankStatusDTO {

     // 현재 탱크에 채워진 수소량 (kg)
    private BigDecimal currentTankLevelKg;

    // 1000kg을 모두 채운 탱크의 개수
    private long fullTanksCount;

    // 지금까지 누적된 총 수소 생산량 (kg)
    private BigDecimal totalAccumulatedKg;

    // 탱크 하나의 최대 용량 (kg)
    private BigDecimal tankCapacityKg;
    
}
