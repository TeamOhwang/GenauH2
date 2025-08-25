package com.project.alarm;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "plant_generation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PowerOutputRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plant_id", nullable = false, length = 20)
    private String plantId;          // plt001, plt002 등

    @Column(name = "date", nullable = false)
    private LocalDate date;          // YYYY-MM-DD

    @Column(name = "hour", nullable = false)
    private Integer hour;            // 0~23

    @Column(name = "generation_kw", nullable = false)
    private Double generationKw;

    @Column(name = "forecast_kwh", nullable = false)
    private Double forecastKwh;

    @Column(name = "capacity_kw", nullable = false)
    private Integer capacityKw;
}