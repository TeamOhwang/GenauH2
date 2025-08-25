package com.project.service.Sms;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
@Slf4j
public class CoolSmsService implements SmsService {
   
    @Value("${coolsms.api.key}")
    private String apiKey;

    @Value("${coolsms.api.secret}")
    private String apiSecret;

    @Value("${coolsms.sender.number}")
    private String senderNumber;

    private DefaultMessageService messageService;

    @PostConstruct
    private void init() {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
    }

    @Override
    public void sendSms(String recipientPhoneNumber, String text) {
        if (recipientPhoneNumber == null || recipientPhoneNumber.isBlank()) {
            log.warn("수신자 번호가 없어 SMS를 발송할 수 없습니다.");
            return;
        }

        Message message = new Message();
        message.setFrom(senderNumber);
        message.setTo(recipientPhoneNumber);
        message.setText(text);

        try {
            messageService.sendOne(new SingleMessageSendingRequest(message));
            log.info("📱 [SMS 발송 성공] To: {}, Message: {}", recipientPhoneNumber, text);
        } catch (Exception e) {
            log.error("❌ [SMS 발송 실패] To: {}", recipientPhoneNumber, e);
        }

    }
}
