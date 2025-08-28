package com.project.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class IdlePowerComparisonDTO {

    // 시간 (0 ~ 23)
    private int hour;

    // 해당 시간의 모든 예측 유휴 전력 (kW) 목록
    private List<BigDecimal> predictedIdlePowerKw;

    // 해당 시간의 모든 실제 유휴 전력 (kW) 목록
    private List<BigDecimal> actualIdlePowerKw;
    
}