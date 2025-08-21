package com.project.alarm;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecipientService {
    private static final String KEY = "alert:recipientEmail";
    private final StringRedisTemplate redis;

    public void setEmail(String email) {
        if (email == null || email.isBlank()) return;
        redis.opsForValue().set(KEY, email.trim());
    }

    public String getEmail() {
        return redis.opsForValue().get(KEY);
    }
}
