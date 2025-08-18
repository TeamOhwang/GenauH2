package com.project.dto;


import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class HourlyAvg {
    int hour;
    double genKwAvg;
    double predKwhAvg;
}
