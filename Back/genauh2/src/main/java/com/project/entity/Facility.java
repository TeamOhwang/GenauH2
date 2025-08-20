package com.project.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "facilityId", nullable = false, updatable = false)
    private Long facilityId;

    @Column(name = "orgId", nullable = false)
    private Long orgId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "modelNo", nullable = false, length = 100)
    private String modelNo;

    @Column(name = "cellCount", nullable = false)
    private Integer cellCount;

    @Column(name = "ratedPowerKw", nullable = false, precision = 10, scale = 2)
    private BigDecimal ratedPowerKw; // 정격 전력(kW)

    @Column(name = "ratedOutputKgH", nullable = false, precision = 10, scale = 3)
    private BigDecimal ratedOutputKgH; // 정격 출력(kg/h)

    @Column(name = "secNominalKwhPerKg", nullable = false, precision = 10, scale = 3)
    private BigDecimal secNominalKwhPerKg; // 기준 SEC(kWh/kg)

    @Column(name = "catalystInstallDate")
    private LocalDate catalystInstallDate;

    @Column(name = "catalystLifeHours")
    private Integer catalystLifeHours;

    @Column(name = "location", length = 255)
    private String location;

    // DB에서 자동으로 세팅 (DEFAULT CURRENT_TIMESTAMP)
    @Column(name = "createdAt", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
