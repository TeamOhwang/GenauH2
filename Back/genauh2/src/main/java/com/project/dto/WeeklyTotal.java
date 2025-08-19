package com.project.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class WeeklyTotal {
    private int year; //년도
    private int weekOfYear; //몇주차
    private double genKwhTotal; // 주간 실제 발전량 합계
    private double predKwhTotal; // 주간 예측 발전량 합계
}
