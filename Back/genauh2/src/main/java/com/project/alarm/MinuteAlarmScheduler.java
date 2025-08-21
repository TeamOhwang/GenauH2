package com.project.alarm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MinuteAlarmScheduler {

    private final MinutelyMetricRepository repo;
    private final EmailSender email;
    private final RecipientService recipientService;
    private final StringRedisTemplate redis;

    @Value("${alert.threshold:30}") private double threshold;
    @Value("${alert.dedup-seconds:120}") private int dedupSeconds;

    // 매 분 0초(Asia/Seoul) 현재 "현실의 분"과 minute_timestamp의 분이 같은 레코드만 검사
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void checkAndNotify() {
        LocalDateTime start = LocalDateTime.now(ZoneId.of("Asia/Seoul")).truncatedTo(ChronoUnit.MINUTES);
        LocalDateTime end   = start.plusMinutes(1);

        List<MinutelyMetric> hits = repo
            .findByMetricValueLessThanEqualAndMinuteTimestampGreaterThanEqualAndMinuteTimestampLessThan(
                threshold, start, end
            );
        if (hits.isEmpty()) return;

        String to = recipientService.getEmail();
        if (to == null || to.isBlank()) {
            log.info("수신자 이메일 미설정: /gh/alert/recipient API로 먼저 등록하세요.");
            return;
        }

        for (MinutelyMetric m : hits) {
            // 같은 행(id)은 dedupSeconds 동안 한 번만 발송
            String key = "alert:sent:" + m.getId();
            Boolean first = redis.opsForValue()
                .setIfAbsent(key, "1", java.time.Duration.ofSeconds(dedupSeconds));
            if (Boolean.FALSE.equals(first)) continue;

            // 요구사항: 제목 'Alert', 본문 'alert!'
            email.send(to, "Alert", "alert!");

            String when = m.getMinuteTimestamp().atZone(ZoneId.of("Asia/Seoul"))
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            log.info("메일 발송 to={} id={} type={} value={} ts={}",
                to, m.getId(), m.getMetricType(), m.getMetricValue(), when);
        }
    }
}
