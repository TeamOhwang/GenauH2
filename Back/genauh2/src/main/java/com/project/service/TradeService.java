package com.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.entity.Reg_avg_price;
import com.project.repository.TradeRepository;

@Service
public class TradeService {
	@Autowired
	private TradeRepository tradeRepo;
	
	public List<Reg_avg_price> tradeList(){
		
		return tradeRepo.findAll();
	}
}