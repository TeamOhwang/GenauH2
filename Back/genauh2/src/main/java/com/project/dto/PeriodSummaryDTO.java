package com.project.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import java.time.LocalDate;

@Getter
@ToString
@Builder
public class PeriodSummaryDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private String plantId;        // null이면 전체 발전소
    private Double totalGenerationKwh;  // 실제 발전량 합계
    private Double totalForecastKwh;    // 예측량 합계
    private Double accuracyRate;        // 예측 정확도 (실제/예측 * 100)
    private Integer dataCount;          // 데이터 건수
}