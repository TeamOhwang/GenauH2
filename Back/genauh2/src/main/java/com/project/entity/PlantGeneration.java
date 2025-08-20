package com.project.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA용
@Entity
@Table(name = "plant_generation")
public class PlantGeneration {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private LocalDate date;

    @Column(nullable=false)
    private Integer hour; // 0~23

    @Column(nullable=false)
    private Double generation_Kw;

    @Column(nullable=false)
    private Double forecast_Kwh;

    @Column(nullable=false)
    private Integer capacity_Kw;

    // 읽기 전용이라 세터 없음 (필요 시 추가)
}