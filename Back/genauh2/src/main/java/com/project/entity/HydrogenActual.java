// src/main/java/com/project/entity/HydrogenActual.java

package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_real")
@Data
public class HydrogenActual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hydrogenActualId") // ✅ PK 컬럼명 수정 (hydrogenActual -> hydrogenActualId)
    private Long hydrogenActualId;

    @Column(name = "facid", nullable = false)
    private Long facilityId;
    
    @Column(name = "orgid")
    private Long orgId;

    @Column(name = "plant_id")
    private String plantId;

    @Column(nullable = false)
    private LocalDateTime ts;

    @Column(name = "idlePowerKw", precision = 10, scale = 3)
    private BigDecimal idlePowerKw;

    @Column(name = "productionKg", nullable = false, precision = 12, scale = 3)
    private BigDecimal productionKg;

    @Column(name = "powerConsumedKwh", precision = 12, scale = 3) // ✅ 컬럼명 수정 (powerConsumerKw -> powerConsumedKwh)
    private BigDecimal powerConsumedKwh;

    @Column(name = "utilizationRate", precision = 10, scale = 3)
    private BigDecimal utilizationRate;
}