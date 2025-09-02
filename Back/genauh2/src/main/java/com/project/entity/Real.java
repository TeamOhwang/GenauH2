package com.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity(name = "ProductionRealEntity")
@Table(name = "production_real")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Real {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hydrogenActualId")  // DB 컬럼명만 수정
    private Long hydrogenActualId;      // 필드명은 그대로
    
    @Column(name = "facid")
    private Long facid;
    
    @Column(name = "orgId")             // DB 컬럼명만 수정
    private Long orgid;                 // 필드명은 그대로
    
    @Column(name = "plant_id")
    private String plantId;
    
    @Column(name = "ts")
    private LocalDateTime ts;
    
    @Column(name = "idlePowerKw")       // DB 컬럼명만 수정
    private BigDecimal idlepowerkw;     // 필드명은 그대로
    
    @Column(name = "productionKg")      // DB 컬럼명만 수정
    private BigDecimal productionKg;    // 필드명은 그대로
    
    @Column(name = "powerConsumedKwh")  // DB 컬럼명만 수정
    private BigDecimal powerConsumedKwh; // 필드명은 그대로
    
    @Column(name = "utilizationRate")   // DB 컬럼명만 수정
    private BigDecimal utilizationRate; // 필드명은 그대로
}