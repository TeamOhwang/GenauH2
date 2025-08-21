//package com.project.alarm;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import java.time.LocalDateTime;
//import java.time.ZoneId;
//import java.time.format.DateTimeFormatter;
//import java.time.Duration;
//import java.util.List;
//
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class MinuteAlarmScheduler {
//
//    private final MinutelyMetricRepository repo;
//    private final EmailSender email;
//    private final RecipientService recipientService;
//    private final DedupGuard dedup;   // ⬅️ Redis 대신 DedupGuard 사용
//
//    @Value("${alert.threshold:30}") private double threshold;
//    @Value("${alert.dedup-seconds:90}") private int dedupSeconds; // 60~90 권장
//
//    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
//    public void checkAndNotify() {
//        var now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
//        int minute = now.getMinute();
//        log.debug("[ALARM] tick minute={} threshold={}", String.format("%02d", minute), threshold);
//
//        // 날짜 무시, '현재 분'과 동일한 minute(minute_timestamp) 중 최신 1건 조회
//        List<MinutelyMetric> hits = repo.findLatestCriticalByMinuteOfHour(threshold, minute);
//        if (hits.isEmpty()) {
//            log.debug("[ALARM] no-hit: minute={} / threshold<={}", minute, threshold);
//            return;
//        }
//
//        String to = recipientService.getEmail();
//        if (to == null || to.isBlank()) {
//            log.warn("[ALARM] recipient not set -> skip. call POST /gh/alert/recipient");
//            return;
//        }
//
//        // 분 버킷으로 분당 1회만 발송 (Redis 실패 시 자동 폴백)
//        String minuteBucket = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
//        String key = "alert:sent:" + minuteBucket;
//        boolean first = dedup.tryOnce(key, Duration.ofSeconds(dedupSeconds));
//        if (!first) {
//            log.info("[ALARM] dedup skip: minuteBucket={} ttl={}s", minuteBucket, dedupSeconds);
//            return;
//        }
//
//        // 메일 발송
//        try {
//            email.send(to, "Alert", "alert!");
//            var m = hits.get(0);
//            String when = m.getMinuteTimestamp()
//                    .atZone(ZoneId.of("Asia/Seoul"))
//                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
//            log.info("[ALARM] mail sent ✅ to={} (latest id={}) value={} ts={} minute={}",
//                    to, m.getId(), m.getMetricValue(), when, minute);
//        } catch (Exception e) {
//            log.error("[ALARM] mail send failed ❌ to={}", to, e);
//        }
//    }
//}
