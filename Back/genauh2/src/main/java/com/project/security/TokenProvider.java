package com.project.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Slf4j
@Service
public class TokenProvider {
    
    // 하이픈 없는 안전한 SECRET_KEY (최소 64자)
    private static final String SECRET_KEY = "myVerySecretKeyForJWTTokenGenerationAndValidation1234567890123456789012345678901234567890";
    
    // SecretKey 객체 생성
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }
    
    public String create(String orgId) {
        try {
            log.info("🔑 토큰 생성 시작 - userId: {}", orgId);
            
            // 토큰 만료 시간을 1일로 설정
            Date expiryDate = Date.from(
                    Instant.now().plus(1, ChronoUnit.DAYS)
            );
            
            // JWT 토큰 생성 (최신 방식)
            String token = Jwts.builder()
            		.setSubject(String.valueOf(orgId))
                    .setIssuer("demo-app")
                    .setIssuedAt(new Date())
                    .setExpiration(expiryDate)
                    .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                    .compact();
                    
            log.info("✅ 토큰 생성 완료");
            return token;
            
        } catch (Exception e) {
            log.error("❌ 토큰 생성 오류: {}", e.getMessage(), e);
            throw new RuntimeException("토큰 생성 실패", e);
        }
    }
    
    public String validateAndGetUserId(String token) {
        try {
            log.debug("🔍 토큰 검증 시작");
            
            // JWT 라이브러리를 사용하여 시크릿 키로 토큰을 파싱하고 검증 (최신 방식)
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String orgId = claims.getSubject();
            log.debug("✅ 토큰 검증 완료 - userId: {}", orgId);
            
            // 토큰의 subject를 반환
            return orgId;
            
        } catch (Exception e) {
            log.error("❌ 토큰 검증 오류: {}", e.getMessage());
            return null;
        }
    }
}