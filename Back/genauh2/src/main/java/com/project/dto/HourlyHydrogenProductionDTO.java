package com.project.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HourlyHydrogenProductionDTO {
    private int hour;
    private double hydrogenKg;
}