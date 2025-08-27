package com.project.controller;

import com.project.dto.HydrogenTankStatusDTO;
import com.project.service.HydrogenStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


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
    
}
