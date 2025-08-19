// 알림 규칙
package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "alert_rules")
@Data
public class AlertRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // 이 규칙을 설정한 사용자 ID

    @Column(nullable = false)
    private String metric; // 대상 지표 (예: "generationKw", "efficiency")

    @Column(nullable = false)
    private String operator; // 비교 연산자 (예: "<", ">", "=")

    @Column(nullable = false)
    private Double threshold; // 임계값

    private boolean enabled = true; // 규칙 활성화 여부
}