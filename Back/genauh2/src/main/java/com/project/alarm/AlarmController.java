package com.project.alarm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alarms")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    // 사용자의 모든 알림 규칙 조회
    @GetMapping
    public ResponseEntity<List<Alarms>> getAlarms(@RequestParam Long facilityId) {
        // 참고: 실제 프로덕션에서는 @RequestHeader 대신 SecurityContext에서 사용자 ID를 가져옵니다.
        return ResponseEntity.ok(alarmService.getAlarmsByFacilityId(facilityId));
    }

    // 새로운 알림 규칙 생성
    @PostMapping
    public ResponseEntity<Alarms> createAlarm(@RequestBody Alarms alarm) {
        return ResponseEntity.ok(alarmService.createAlarm(alarm));
    }
}