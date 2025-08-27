package com.project.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictDTO {
    
    private Long predictionid;
    private Long facid;
    private Long orgid;
    private String plantId;
    private LocalDateTime ts;
    private BigDecimal idlepowerkw;
    private BigDecimal predictedmaxkg;
    private BigDecimal predictedcurrentkg;
    private String facilityName;
    private String plantName;
}