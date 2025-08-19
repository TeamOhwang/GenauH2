package com.project.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MonthlyTotal {
    private int year; //년도
    private int month; //월
    private double genKwhTotal; // 월간 실제 발전량 합계
    private double predKwhTotal; // 월간 예측 발전량 합계
    
}
