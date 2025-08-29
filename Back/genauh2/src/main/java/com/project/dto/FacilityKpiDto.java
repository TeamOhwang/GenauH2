package com.project.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface FacilityKpiDto {
    Long getOrgId();
    Long getFacId();
    String getFacilityName();
    LocalDateTime getTs();
    BigDecimal getProductionKg();
    BigDecimal getPredictedMaxKg();
}

