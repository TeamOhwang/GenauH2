package com.project.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.entity.Facility;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/plant")
public class FacilitiesController {
	@GetMapping("/insert")
	public ResponseEntity<Map<String, Object>> facInsert(@RequestBody Facility fac){
		return null;
	}
}
