package com.project.repository;

import com.project.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    // 사용되지 않은 토큰으로 검색
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    
    // 이메일로 사용되지 않은 최신 토큰 검색
    Optional<PasswordResetToken> findByEmailAndUsedFalse(String email);
    
    // 이메일로 모든 토큰 검색 (생성일 역순)
    List<PasswordResetToken> findByEmailOrderByCreatedAtDesc(String email);
    
    // 만료된 토큰 삭제용
    void deleteByExpiryDateBefore(LocalDateTime dateTime);
    
    // 특정 이메일의 모든 토큰 삭제 (새 토큰 생성 전)
    void deleteByEmail(String email);
    
    // 사용된 토큰들 정리용
    void deleteByUsedTrue();
}