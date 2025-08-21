package com.project.repository;

import com.project.entity.Reg_price;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegionPriceRepository extends JpaRepository<Reg_price, Long> {
    List<Reg_price> findByRegion(String region);
}
