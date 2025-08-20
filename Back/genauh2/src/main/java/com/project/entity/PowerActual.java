package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "power_actual")
@Data
public class PowerActual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long powerActualId;

    @Column(nullable = false)
    private Long facilityId;

    @Column(nullable = false)
    private LocalDateTime ts;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal powerAvailableKw;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal powerUsedKw;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal idlePowerKw;
}