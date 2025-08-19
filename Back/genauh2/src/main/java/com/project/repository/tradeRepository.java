package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.entity.reg_avg_price;

public interface tradeRepository extends JpaRepository<reg_avg_price, String> {
	
}