package com.project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "facilities")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Facilities {

    @Id
    @Column(name = "facilityid", length = 50, nullable = false)
    private String facilityId;

    @Column(name = "name", length = 100)
    private String Name;

    @Column(name = "location", length = 100)
    private String Location;

    @Column(name = "secNominalKwhPerKg", nullable = false)
    private Double secNominalKwhPerKg;
}
