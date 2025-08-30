package com.project.controller;

import com.project.alarm.ProductionAlarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ProductionAlarmService alarmService;
    
    @GetMapping("/hash/{password}")
    public String generateHash(@PathVariable String password) {
        return passwordEncoder.encode(password);
    }
    
    /**
     * 수동으로 생산량 알림을 테스트합니다.
     * 스케줄러를 기다리지 않고 즉시 실행됩니다.
     */
    @PostMapping("/production-alarm")
    public ResponseEntity<String> testProductionAlarm() {
        try {
            alarmService.checkProductionAndNotify();
            return ResponseEntity.ok("테스트 실행 완료 - 로그를 확인하세요");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("테스트 실행 실패: " + e.getMessage());
        }
    }
}