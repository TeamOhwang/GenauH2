package com.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_real")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Real {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hydrogenactualid")
    private Long hydrogenActualId;
    
    @Column(name = "facid")
    private Long facid;
    
    @Column(name = "orgid") 
    private Long orgid;
    
    @Column(name = "plant_id", length = 16)
    private String plantId;
    
    @Column(name = "ts")
    private LocalDateTime ts;
    
    @Column(name = "idlepowerkw", precision = 10, scale = 3)
    private BigDecimal idlepowerkw;
    
    @Column(name = "productionkg", precision = 12, scale = 3)
    private BigDecimal productionKg;
    
    @Column(name = "powerconsumedkwh", precision = 12, scale = 3)
    private BigDecimal powerConsumedKwh;
    
    @Column(name = "utilizationrate", precision = 10, scale = 3)
    private BigDecimal utilizationRate;
}