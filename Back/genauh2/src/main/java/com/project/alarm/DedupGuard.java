package com.project.alarm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * "이 키는 TTL 동안 한 번만 허용" 로직.
 * - 1순위: Redis SETNX + TTL
 * - 실패 시: 인메모리(프로세스 범위) 폴백
 */
@Component
@Slf4j
public class DedupGuard {

    private final Optional<StringRedisTemplate> redisOpt;
    private final Map<String, Long> local = new ConcurrentHashMap<>();

    public DedupGuard(Optional<StringRedisTemplate> redisOpt) {
        this.redisOpt = redisOpt;
    }

    /** true면 "이번에 처음" → 진행 / false면 최근 TTL 내 중복 */
    public boolean tryOnce(String key, Duration ttl) {
        // Redis가 있으면 우선 시도
        if (redisOpt.isPresent()) {
            try {
                Boolean ok = redisOpt.get().opsForValue().setIfAbsent(key, "1", ttl);
                if (Boolean.TRUE.equals(ok)) return true;
                if (Boolean.FALSE.equals(ok)) return false; // 이미 존재
                // null이면 애매하니 폴백으로…
            } catch (Exception e) {
                log.warn("[DEDUP] Redis unavailable, fallback to in-memory for key={}", key);
            }
        }

        // 인메모리 폴백
        long now = System.currentTimeMillis();
        Long prev = local.get(key);
        if (prev != null && now - prev < ttl.toMillis()) {
            return false; // TTL 내 재시도 → 거부
        }
        local.put(key, now);

        // 가벼운 청소(10분 지난 키는 제거)
        local.entrySet().removeIf(en -> now - en.getValue() > 10 * 60_000L);
        return true;
    }
}
