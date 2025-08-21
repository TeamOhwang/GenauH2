package com.project.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionPriceDTO {
    private Long id;
    private String stationName;
    private String address;
    private String region;
    private Integer price;
    private String vehicleType;
}
