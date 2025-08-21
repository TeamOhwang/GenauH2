package com.project.alarm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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
    @Value("${alert.dedup-seconds:90}") private int dedupSeconds; // 60~90 권장

    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void checkAndNotify() {
        var now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        int minute = now.getMinute();
        log.debug("[ALARM] tick minute={} threshold={}", String.format("%02d", minute), threshold);

        // 날짜 무시, '현재 분'과 동일한 minute(minute_timestamp) 중 최신 1건만 조회
        List<MinutelyMetric> hits = repo.findLatestCriticalByMinuteOfHour(threshold, minute);
        if (hits.isEmpty()) {
            log.debug("[ALARM] no-hit: minute={} / threshold<={}", minute, threshold);
            return;
        }

        String to = recipientService.getEmail();
        if (to == null || to.isBlank()) {
            log.warn("[ALARM] recipient not set -> skip. call POST /gh/alert/recipient first");
            return;
        }

        // 분 버킷으로 분당 1회만 발송
        String minuteBucket = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        String key = "alert:sent:" + minuteBucket;
        Boolean first = redis.opsForValue()
                .setIfAbsent(key, "1", java.time.Duration.ofSeconds(dedupSeconds));
        if (Boolean.FALSE.equals(first)) {
            log.info("[ALARM] dedup skip: minuteBucket={} ttl={}s", minuteBucket, dedupSeconds);
            return;
        }

        var m = hits.get(0);
        String when = m.getMinuteTimestamp()
                .atZone(ZoneId.of("Asia/Seoul"))
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        log.info("[ALARM] sending mail... to={} value={} (<= {}) ts={}",
                to, m.getMetricValue(), threshold, when);

        try {
            email.send(to, "Alert", "alert!");
            log.info("[ALARM] mail sent ✅ to={} minuteBucket={}", to, minuteBucket);
        } catch (Exception e) {
            log.error("[ALARM] mail send failed ❌ to={} minuteBucket={}", to, minuteBucket, e);
        }
    }
}
