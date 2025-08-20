package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hydrogen_actual")
@Data
public class HydrogenActual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hydrogenActualId;

    @Column(nullable = false)
    private Long facilityId;

    @Column(nullable = false)
    private LocalDateTime ts;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal productionKg;

    @Column(precision = 12, scale = 3)
    private BigDecimal powerConsumedKwh;

    @Column(precision = 10, scale = 3)
    private BigDecimal utilizationRate;
}