package com.project.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class DailyTotal {
    LocalDate date;
    double genKwhTotal;
    double predKwhTotal;
}