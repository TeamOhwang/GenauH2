package com.project.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "facilities")
public class Facility {

    public enum ElectrolysisType {
        PEM, ALK, SOEC
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "facId", nullable = false, updatable = false)
    private Long facId;

    @Column(name = "orgId", nullable = false)
    private Long orgId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ElectrolysisType type;

    @Column(name = "maker", length = 100)
    private String maker;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "power_kw", nullable = false, precision = 10, scale = 2)
    private BigDecimal powerKw; // 정격 전력(kW)

    @Column(name = "h2_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal h2Rate; // 정격 수소 생산량(kg/h)

    @Column(name = "spec_kwh", nullable = false, precision = 10, scale = 2)
    private BigDecimal specKwh; // 특정 소비전력(kWh/kg)

    @Column(name = "purity", precision = 6, scale = 3)
    private BigDecimal purity; // 수소 순도(%)

    @Column(name = "pressure", precision = 10, scale = 2)
    private BigDecimal pressure; // 인출 압력(bar)

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "install")
    private LocalDate install; // 설치 일자

    // DB에서 자동으로 세팅 (DEFAULT CURRENT_TIMESTAMP)
    @Column(name = "created", nullable = false, insertable = false, updatable = false)
    private LocalDateTime created;
}