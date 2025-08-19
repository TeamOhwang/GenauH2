package com.project.service;

import com.project.entity.AlertRule;
import com.project.entity.Notification;
import com.project.entity.PlantGeneration;
import com.project.repository.AlertRuleRepository;
import com.project.repository.NotificationRepository;
import com.project.repository.PlantGenerationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRuleRepository alertRuleRepository;
    private final NotificationRepository notificationRepository;
    private final PlantGenerationRepository plantGenerationRepository;

    // 10분마다 실행 (fixedRate = 600000)
    @Scheduled(fixedRate = 600000)
    public void checkAlerts() {
        System.out.println("Checking for alerts...");
        List<AlertRule> rules = alertRuleRepository.findByEnabledIsTrue();
        PlantGeneration latestData = plantGenerationRepository.findFirstByOrderByDateDescHourDesc();

        if (latestData == null) return;

        for (AlertRule rule : rules) {
            boolean triggered = false;
            if ("generationKw".equals(rule.getMetric())) {
                if ("<".equals(rule.getOperator()) && latestData.getGenerationKw() < rule.getThreshold()) {
                    triggered = true;
                }
                // (필요에 따라 ">", "=" 등 다른 연산자 조건 추가)
            }

            if (triggered) {
                Notification notification = new Notification();
                notification.setUserId(rule.getUserId());
                notification.setMessage(String.format(
                    "경고: %s 값이 %.2f%s 임계치(%.2f)를 벗어났습니다.",
                    rule.getMetric(), latestData.getGenerationKw(), rule.getOperator(), rule.getThreshold()
                ));
                notificationRepository.save(notification);
            }
        }
    }
    
    // 사용자를 위한 알림 규칙 관련 CRUD 메소드들
    public List<AlertRule> getRulesForUser(Long userId) {
        return alertRuleRepository.findByUserId(userId);
    }
    
    public AlertRule createRule(AlertRule rule) {
        return alertRuleRepository.save(rule);
    }
}