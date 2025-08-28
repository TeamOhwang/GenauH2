package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyHydrogenProductionDTO {

    // 시간 (0 ~ 23)
    private int hour;

    // 해당 시간에 생산된 수소량 (kg)
    private BigDecimal productionKg;
    
}
