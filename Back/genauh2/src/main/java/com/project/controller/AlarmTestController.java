// 문자 알림 테스트용 컨트롤러 (개발용)

package com.project.controller;

import com.project.alarm.ProductionChangeNotifier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class AlarmTestController {

    private final ProductionChangeNotifier productionChangeNotifier;

    /**
     * SMS 알림 발송 로직을 수동으로 실행시키는 테스트용 엔드포인트입니다.
     */
    @GetMapping("/trigger-alarm")
    public ResponseEntity<String> triggerAlarmCheck() {
        try {
            productionChangeNotifier.checkProductionChanges();
            return ResponseEntity.ok("알림 검사 로직을 성공적으로 실행했습니다. SMS 발송 여부는 콘솔 로그를 확인하세요.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("알림 검사 실행 중 오류 발생: " + e.getMessage());
        }
    }
    
}
