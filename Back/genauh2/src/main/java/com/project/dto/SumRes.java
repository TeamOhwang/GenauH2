package com.project.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SumRes {

    private Long orgId;                // 사업자 ID
    private Long facId;                // 설비 ID
    private String facilityName;       // 설비 이름 (alias에 맞춤)
    private LocalDateTime ts;          // 시간 단위
    private BigDecimal totalMaxKg;     // 시간당 최대 수소 생산량 합계
    private BigDecimal totalCurrentKg; // 시간당 실제 수소 생산량 합계
    private BigDecimal cumulativeMax;  // 누적 최대 수소 생산량
    private BigDecimal cumulativeCurrent; // 누적 실제 수소 생산량
}
