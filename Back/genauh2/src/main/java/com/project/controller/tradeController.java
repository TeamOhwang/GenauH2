package com.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.entity.reg_avg_price;
import com.project.service.tradeService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/trade")
public class tradeController {
	
	@Autowired
	private tradeService tradeservice;
	
	@GetMapping("/list")
	public ResponseEntity<List<reg_avg_price>> tradeList(){
		try {
			List<reg_avg_price> result = tradeservice.tradeList();
			return ResponseEntity.ok(result);
			
		} catch (Exception e) {
			log.error("거래 목록 오류 발생", e.getMessage(), e);
		}
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	}
}