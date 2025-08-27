package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, columnDefinition = "VARCHAR(255) COMMENT '비밀번호 리셋 토큰'")
    private String token;
    
    @Column(nullable = false, columnDefinition = "VARCHAR(255) COMMENT '사용자 이메일'")
    private String email;
    
    @Column(nullable = false, columnDefinition = "BIGINT UNSIGNED COMMENT '조직 ID'")
    private Long orgId;
    
    @Column(nullable = false, columnDefinition = "DATETIME COMMENT '토큰 만료 시간'")
    private LocalDateTime expiryDate;
    
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0 COMMENT '토큰 사용 여부'")
    private boolean used = false;
    
    @Column(nullable = false, updatable = false, columnDefinition = "DATETIME COMMENT '생성일시'")
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.expiryDate == null) {
            this.expiryDate = LocalDateTime.now().plusHours(24);
        }
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}