package com.project.alarm;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "minutely_metrics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MinutelyMetric {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "minute_timestamp", nullable = false)
    private LocalDateTime minuteTimestamp;

    @Column(name = "metric_value", nullable = false)
    private Double metricValue;

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(name = "additional_info", length = 500)
    private String additionalInfo;
}
