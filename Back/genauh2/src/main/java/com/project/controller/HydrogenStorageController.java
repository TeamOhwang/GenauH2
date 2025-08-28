package com.project.controller;

import com.project.dto.HydrogenTankStatusDTO; // 수소탱크 채우기
import com.project.dto.HourlyHydrogenProductionDTO; // 시간대별 수소 생산량
import com.project.service.HydrogenStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
public class HydrogenStorageController {

    private final HydrogenStorageService hydrogenStorageService;

    /**
     * 특정 시설(plant)의 누적 수소 생산량 및 탱크 상태를 조회합니다.
     * @param plantId 조회할 발전소 ID (e.g., "plt001")
     * @return HydrogenTankStatusDTO
     */
    @GetMapping("/status")
    public ResponseEntity<HydrogenTankStatusDTO> getHydrogenStorageStatus(
            @RequestParam(value = "plantId") String plantId) {

        HydrogenTankStatusDTO status = hydrogenStorageService.getAccumulatedProduction(plantId);
        return ResponseEntity.ok(status);
    }

    /**
     * [신규 추가] 특정 발전소의 오늘 하루 동안의 시간별 수소 생산량 데이터를 조회합니다. (그래프용)
     * @param plantId 조회할 발전소 ID
     * @return 시간별 수소 생산량 DTO 리스트
     */
    @GetMapping("/hourly-hydrogen-production")
    public ResponseEntity<List<HourlyHydrogenProductionDTO>> getHourlyHydrogenProduction(
            @RequestParam(value = "plantId") String plantId) {

        List<HourlyHydrogenProductionDTO> hourlyData = hydrogenStorageService.getHourlyProductionForToday(plantId);
        return ResponseEntity.ok(hourlyData);
    }
    
}
