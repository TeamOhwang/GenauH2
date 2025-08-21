package com.project.alarm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

@Service
@Slf4j
public class RecipientService {

    private static final String KEY = "alert:recipientEmail";

    // Redis 연결이 아예 없는 경우도 허용하기 위해 Optional 주입
    private final Optional<StringRedisTemplate> redisOpt;

    // 폴백용 인메모리 저장소 (프로세스 재시작 시 초기화됨)
    private final AtomicReference<String> local = new AtomicReference<>();

    public RecipientService(Optional<StringRedisTemplate> redisOpt) {
        this.redisOpt = redisOpt;
    }

    /** 프론트에서 넘어온 이메일을 저장. Redis 저장 실패 시에도 인메모리에 보관 */
    public void setEmail(String email) {
        String v = (email == null ? null : email.trim());
        local.set(v); // 항상 로컬에도 저장(최소 보장)

        if (v == null || v.isBlank()) {
            log.warn("[RECIPIENT] empty email -> stored as null (in-memory)");
            return;
        }

        // Redis가 있으면 먼저 시도, 실패해도 에러 던지지 않음
        if (redisOpt.isPresent()) {
            try {
                redisOpt.get().opsForValue().set(KEY, v);
                log.info("[RECIPIENT] set email in Redis: {}", v);
            } catch (Exception e) {
                log.warn("[RECIPIENT] Redis unavailable, fallback to in-memory: {}", v);
            }
        } else {
            log.info("[RECIPIENT] Redis bean not present, using in-memory only: {}", v);
        }
    }

    /** 현재 수신 이메일을 조회. Redis에서 읽되 실패하면 인메모리 값을 반환 */
    public String getEmail() {
        if (redisOpt.isPresent()) {
            try {
                String r = redisOpt.get().opsForValue().get(KEY);
                if (r != null && !r.isBlank()) {
                    if (!r.equals(local.get())) local.set(r);
                    return r;
                }
            } catch (Exception e) {
                log.warn("[RECIPIENT] Redis get failed, using in-memory value");
            }
        }
        return local.get();
    }
}
