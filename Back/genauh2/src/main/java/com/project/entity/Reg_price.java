package com.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "region_price",
       indexes = {
           @Index(name = "idx_region", columnList = "region"),
           @Index(name = "idx_station", columnList = "station_name")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reg_price {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "station_name", nullable = false, length = 255)
    private String stationName;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "region", nullable = false, length = 100)
    private String region;

    @Column(name = "price")
    private Integer price;

    @Column(name = "vehicle_type", length = 100)
    private String vehicleType;
}
