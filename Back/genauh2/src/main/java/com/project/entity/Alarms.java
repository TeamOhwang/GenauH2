// 알림
package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "alarms")
@Data
public class Alarms {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alarmId;

    @Column(nullable = false)
    private Long facilityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlarmType alarmType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    private String reason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private Long ackBy;

    public enum AlarmType {
        LOW_PRODUCTION, STOP, OTHER
    }

    public enum Severity {
        INFO, WARN, CRITICAL
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}