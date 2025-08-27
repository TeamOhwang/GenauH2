package com.project.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RealDTO {
    
    private Long hydrogenActualId;  // hydrogenActualId (AUTO_INCREMENT)
    private Long facid;             // facilities 테이블의 facid
    private Long orgid;             // facilities 테이블의 orgid
    private String plantId;         // plant_generation 테이블의 plant_id
    private LocalDateTime ts;       // date + hour 조합한 timestamp
    private BigDecimal idlepowerkw; // 8~15 랜덤값
    private BigDecimal productionKg;    // ((generation_kw - idlepowerkw) / spec_kwh)
    private BigDecimal powerConsumedKwh; // (generation_kw - idlepowerkw)
    private BigDecimal utilizationRate;  // (generation_kw / capacity_kw)
    
    // 조회용 추가 필드
    private String facilityName;    // facilities 테이블의 name
    private String plantName;       // plants 테이블의 name
    private BigDecimal generationKw; // plant_generation 테이블의 generation_kw
    private BigDecimal capacityKw;   // plant_generation 테이블의 capacity_kw
}