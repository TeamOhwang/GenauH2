package com.project.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

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
