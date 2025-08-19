package com.project.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryDTO {
    private Double currentGenerationKw; // 현재 발전량 (kW)
    private Double currentForecastKwh;  // 현재 예측량 (kWh)
    private Integer capacityKw;         // 설비용량 (kW)
    private Double idlePowerKw;         // 현재 유휴 전력량 (kW)
    private Double conversionEfficiency; // 변환 효율 (%)
}