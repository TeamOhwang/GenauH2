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
public class WeeklyProductionDTO {
    // 년
    private int year;
    // 월
    private int month;
    // 월별 주차 (1주차, 2주차...)
    private int weekOfMonth;
    // 화면 표시용 라벨 ("8월 1주차")
    private String weekLabel;
    // 해당 주의 총 수소 생산량 (kg)
    private BigDecimal totalProductionKg;
}