package com.project.controller;

import com.project.entity.AlertRule;
import com.project.entity.Notification;
import com.project.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    // 사용자의 모든 알림 규칙 조회
    @GetMapping("/rules")
    public ResponseEntity<List<AlertRule>> getMyRules(@RequestHeader("X-USER-ID") Long userId) {
        // 참고: 실제 프로덕션에서는 @RequestHeader 대신 SecurityContext에서 사용자 ID를 가져옵니다.
        return ResponseEntity.ok(alertService.getRulesForUser(userId));
    }

    // 새로운 알림 규칙 생성
    @PostMapping("/rules")
    public ResponseEntity<AlertRule> createRule(@RequestBody AlertRule rule, @RequestHeader("X-USER-ID") Long userId) {
        rule.setUserId(userId);
        return ResponseEntity.ok(alertService.createRule(rule));
    }
}