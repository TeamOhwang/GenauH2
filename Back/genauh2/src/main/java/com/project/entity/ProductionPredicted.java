package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_predicted")
@Data
public class ProductionPredicted {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long predictionId;

    @Column(nullable = false)
    private Long facilityId;

    @Column(nullable = false)
    private LocalDateTime ts;

    @Column(precision = 10, scale = 3)
    private BigDecimal idlePowerKw;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal predictedMaxKg;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal predictedCurrentKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Method method;

    private String modelVersion;

    public enum Method {
        RULE, ML, HYBRID
    }
}