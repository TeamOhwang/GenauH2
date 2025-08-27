package com.project.service;

import com.project.entity.Organization;
import com.project.entity.PasswordResetToken;
import com.project.repository.OrganizationRepository;
import com.project.repository.PasswordResetTokenRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public boolean requestPasswordReset(String email) {
        log.info("비밀번호 리셋 요청: {}", email);
        
        // 활성 사용자 확인
        Optional<Organization> userOpt = organizationRepository.findByEmailAndStatus(email, Organization.Status.ACTIVE);
        if (!userOpt.isPresent()) {
            log.warn("활성 사용자를 찾을 수 없음: {}", email);
            return false;
        }
        
        Organization user = userOpt.get();
        
        // 기존 토큰들 비활성화
        resetTokenRepository.deleteByEmail(email);
        
        // 새 토큰 생성
        String token = generateSecureToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        resetToken.setOrgId(user.getOrgId());
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        resetToken.setUsed(false);
        
        resetTokenRepository.save(resetToken);
        
        // 이메일 발송
        try {
            emailService.sendPasswordResetEmail(email, token, user.getName());
            log.info("비밀번호 리셋 이메일 발송 완료: {}", email);
            return true;
        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        log.info("비밀번호 리셋 토큰 검증: {}", token);
        
        Optional<PasswordResetToken> resetTokenOpt = resetTokenRepository.findByTokenAndUsedFalse(token);
        
        if (!resetTokenOpt.isPresent()) {
            log.warn("유효하지 않은 토큰: {}", token);
            return false;
        }
        
        PasswordResetToken resetToken = resetTokenOpt.get();
        
        if (resetToken.isExpired()) {
            log.warn("만료된 토큰: {}", token);
            return false;
        }
        
        // 사용자 조회
        Optional<Organization> userOpt = organizationRepository.findById(resetToken.getOrgId());
        if (!userOpt.isPresent()) {
            log.warn("사용자를 찾을 수 없음: {}", resetToken.getOrgId());
            return false;
        }
        
        Organization user = userOpt.get();
        
        // 비밀번호 변경
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(user);
        
        // 토큰 사용 처리
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
        
        // 확인 이메일 발송
        try {
            emailService.sendPasswordChangeConfirmationEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            log.warn("비밀번호 변경 확인 이메일 발송 실패: {}", e.getMessage());
        }
        
        log.info("비밀번호 리셋 완료: {}", user.getEmail());
        return true;
    }

    @Transactional(readOnly = true)
    public boolean validateResetToken(String token) {
        Optional<PasswordResetToken> resetTokenOpt = resetTokenRepository.findByTokenAndUsedFalse(token);
        
        if (!resetTokenOpt.isPresent()) {
            return false;
        }
        
        PasswordResetToken resetToken = resetTokenOpt.get();
        return !resetToken.isExpired();
    }

    @Transactional
    public void cleanupExpiredTokens() {
        resetTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        log.info("만료된 비밀번호 리셋 토큰 정리 완료");
    }

    private String generateSecureToken() {
        StringBuilder token = new StringBuilder(32);
        for (int i = 0; i < 32; i++) {
            token.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return token.toString();
    }
}