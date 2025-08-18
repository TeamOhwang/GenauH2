package com.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/plant")
public class PlantController {
	
	public ResponseEntity<List<String>> getPlantData(
			@RequestParam int day,
			@RequestParam int startTime,
			@RequestParam int endTime){
		try {
			return null;
		} catch (Exception e) {
			return null;		}
	}

}
