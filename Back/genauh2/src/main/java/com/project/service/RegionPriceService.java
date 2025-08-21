package com.project.service;

import com.project.entity.Reg_price;
import com.project.dto.RegionPriceDTO;
import com.project.repository.RegionPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegionPriceService {

    private final RegionPriceRepository repository;

    /** 전체 목록 */
    public List<RegionPriceDTO> getAll() {
        List<Reg_price> list = repository.findAll();
        return list.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** 지역별 목록 */
    public List<RegionPriceDTO> getByRegion(String region) {
        List<Reg_price> list = repository.findByRegion(region);
        return list.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private RegionPriceDTO toDTO(Reg_price e) {
        return RegionPriceDTO.builder()
                .id(e.getId())
                .stationName(e.getStationName())
                .address(e.getAddress())
                .region(e.getRegion())
                .price(e.getPrice())
                .vehicleType(e.getVehicleType())
                .build();
    }
}
