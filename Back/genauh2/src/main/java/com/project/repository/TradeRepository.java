package com.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.entity.Reg_avg_price;

@Repository
public interface TradeRepository extends JpaRepository<Reg_avg_price, String> {
	
}