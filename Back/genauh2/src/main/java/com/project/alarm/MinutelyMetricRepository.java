package com.project.alarm;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface MinutelyMetricRepository extends JpaRepository<MinutelyMetric, Long> {
    List<MinutelyMetric> findByMetricValueLessThanEqualAndMinuteTimestampGreaterThanEqualAndMinuteTimestampLessThan(
            Double threshold, LocalDateTime startInclusive, LocalDateTime endExclusive
    );
}
