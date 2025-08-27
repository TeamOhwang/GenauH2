package com.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String resetToken, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[GENAUH2] 비밀번호 재설정 요청");
            
            // 비밀번호 리셋 링크 생성 (프론트엔드 URL)
            String resetLink = "http://localhost:5174/reset-password?token=" + resetToken;
            
            String htmlContent = createPasswordResetEmailTemplate(userName, resetLink, resetToken);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("비밀번호 리셋 이메일 전송 성공: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("비밀번호 리셋 이메일 전송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 전송에 실패했습니다.", e);
        }
    }

    private String createPasswordResetEmailTemplate(String userName, String resetLink, String token) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>비밀번호 재설정</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .warning { color: #d9534f; font-weight: bold; }
                    .token { background-color: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>GENAUH2</h1>
                        <h2>비밀번호 재설정</h2>
                    </div>
                    <div class="content">
                        <h3>안녕하세요, %s님</h3>
                        <p>비밀번호 재설정 요청을 받았습니다.</p>
                        <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요:</p>
                        
                        <p style="text-align: center;">
                            <a href="%s" class="button">비밀번호 재설정하기</a>
                        </p>
                        
                        <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣어 주세요:</p>
                        <p class="token">%s</p>
                        
                        <div class="warning">
                            <p>⚠️ 중요 안내사항:</p>
                            <ul>
                                <li>이 링크는 24시간 후에 만료됩니다.</li>
                                <li>비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시해주세요.</li>
                                <li>보안을 위해 링크는 한 번만 사용할 수 있습니다.</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>이 이메일은 GENAUH2 시스템에서 자동으로 발송되었습니다.</p>
                        <p>문의사항이 있으시면 시스템 관리자에게 연락해주세요.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, resetLink, resetLink);
    }

    public void sendPasswordChangeConfirmationEmail(String toEmail, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[GENAUH2] 비밀번호가 성공적으로 변경되었습니다");
            
            String htmlContent = createPasswordChangeConfirmationTemplate(userName);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("비밀번호 변경 확인 이메일 전송 성공: {}", toEmail);
            
        } catch (MessagingException e) {
            log.error("비밀번호 변경 확인 이메일 전송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 전송에 실패했습니다.", e);
        }
    }

    private String createPasswordChangeConfirmationTemplate(String userName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>비밀번호 변경 완료</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .success { color: #28a745; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>GENAUH2</h1>
                        <h2>비밀번호 변경 완료</h2>
                    </div>
                    <div class="content">
                        <h3>안녕하세요, %s님</h3>
                        <p class="success">✅ 비밀번호가 성공적으로 변경되었습니다.</p>
                        <p>변경 일시: %s</p>
                        <p>만약 본인이 변경하지 않은 경우, 즉시 시스템 관리자에게 연락해주세요.</p>
                    </div>
                    <div class="footer">
                        <p>이 이메일은 GENAUH2 시스템에서 자동으로 발송되었습니다.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, java.time.LocalDateTime.now().toString());
    }
}