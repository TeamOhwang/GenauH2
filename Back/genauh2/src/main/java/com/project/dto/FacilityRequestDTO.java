package com.project.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilityRequestDTO {
    // facId와 orgId는 서버에서 생성하므로 요청 DTO에는 포함하지 않음
    
    private String name;           // 시설명
    private String type;           // 시설 타입 (PEM, ALK, SOEC 중 하나의 문자열)
    private String maker;          // 제조사
    private String model;          // 모델명
    private Double powerKw;        // 정격 전력 (kW) - JSON에서 Double로 받음
    private Double h2Rate;         // 정격 수소 생산량 (kg/h)
    private Double specKwh;        // 특정 소비전력 (kWh/kg)
    private Double purity;         // 수소 순도 (%)
    private Double pressure;       // 인출 압력 (bar)
    private String location;       // 위치
    private LocalDate install;     // 설치일
    
    // created는 서버에서 자동 생성하므로 요청 DTO에는 포함하지 않음
}