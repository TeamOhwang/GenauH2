package com.project.dto;


import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyPredictedDTO {
	
	private int year;
	
	private int month;
	
	private int weekOfMonth;
	
	private String weekLabel;
	
	private BigDecimal totalPredictedKg;
	
}
