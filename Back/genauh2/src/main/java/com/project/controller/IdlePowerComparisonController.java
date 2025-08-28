package com.project.controller;

import com.project.dto.IdlePowerComparisonDTO;
import com.project.service.IdlePowerComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/comparison")
@RequiredArgsConstructor
public class IdlePowerComparisonController {

    private final IdlePowerComparisonService comparisonService;

    /**
     * 특정 날짜의 시간대별 예측/실제 유휴 전력량 데이터를 비교하여 반환합니다.
     * @param date 조회할 날짜 (YYYY-MM-DD 형식), 지정하지 않으면 오늘 날짜
     * @return 시간대별 유휴 전력 비교 데이터 리스트
     */
    @GetMapping("/idle-power")
    public ResponseEntity<List<IdlePowerComparisonDTO>> getIdlePowerComparison(
        @RequestParam(value = "date", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        // 'date' 파라미터가 비어있으면 오늘 날짜를 기본값으로 사용합니다.
        LocalDate targetDate = (date == null) ? LocalDate.now() : date;

        List<IdlePowerComparisonDTO> comparisonData = comparisonService.getIdlePowerComparison(targetDate);
        return ResponseEntity.ok(comparisonData);
    }
    
}
