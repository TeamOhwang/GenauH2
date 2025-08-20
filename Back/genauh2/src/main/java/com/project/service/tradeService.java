package com.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.entity.reg_avg_price;
import com.project.repository.tradeRepository;

@Service
public class tradeService {
	@Autowired
	private tradeRepository tradeRepo;
	
	public List<reg_avg_price> tradeList(){
		
		return tradeRepo.findAll();
	}
}