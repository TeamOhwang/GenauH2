package com.project.alarm;

import com.project.entity.Organization;
import com.project.entity.Real;
import com.project.repository.OrganizationRepository;
import com.project.repository.RealRepository;
import com.project.service.EmailService;
import com.project.service.Sms.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductionAlarmService {

    private final RealRepository realRepository;
    private final OrganizationRepository organizationRepository;
    private final SmsService smsService;
    private final EmailService emailService;
    private final DedupGuard dedupGuard; // 중복 발송 방지를 위해 추가
    private final AlarmsRepository alarmsRepository;
    /**
     * 매 분마다 실행하여 수소 생산량이 0인지 확인하고 SMS + 이메일 알림을 보냅니다.
     * cron = "0 * * * * *" (매분 0초)
     */
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    @Transactional
    public void checkProductionAndNotify() {
        log.info("수소 생산량 0 감지 스케줄러를 시작합니다.");

        Long targetOrgId = 2L; // 알림을 받을 사용자의 orgId

        // 1. 최근 1시간 내의 생산량 데이터를 조회합니다.
        LocalDateTime now = LocalDateTime.now();
        // 스케줄러 실행 시점보다 약간의 여유를 두어 데이터를 놓치지 않도록 함
        LocalDateTime startTime = now.minusHours(1).minusMinutes(1); 
        List<Real> recentProductions = realRepository.findByOrgidAndTsBetween(targetOrgId, startTime, now);

        if (recentProductions.isEmpty()) {
            log.info("[orgId={}] 최근 1시간 내 생산량 데이터가 없습니다.", targetOrgId);
            return;
        }

        // 2. 생산량이 0인 데이터가 있는지 확인합니다.
        for (Real production : recentProductions) {
            // productionKg가 null이 아니고 0일 경우
            if (production.getProductionKg() != null && production.getProductionKg().compareTo(BigDecimal.ZERO) == 0) {

                // 3. '발생한 시간'을 기준으로 알림을 보내기 위해 중복 발송 키를 생성합니다.
                String dedupKey = String.format("alarm:prod-zero:%d:%s", production.getFacid(), production.getTs().toString());

                // 동일한 타임스탬프의 이벤트에 대해 5분 내 중복 알림 방지
                if (dedupGuard.tryOnce(dedupKey, java.time.Duration.ofMinutes(15))) {
                    log.warn("[생산량 오류 감지! 점검이 필요합니다.] 설비 ID: {}, 시간: {}", production.getFacid(), production.getTs());
                    
                    // 4. SMS + 이메일 알림을 발송합니다.
                    sendNotifications(targetOrgId, production);
                } else {
                    log.info("[중복 알림 스킵] 설비 ID {} 의 {} 시점 알림은 이미 발송되었습니다.", production.getFacid(), production.getTs());
                }
            }
        }
        log.info("수소 생산량 0 감지 스케줄러를 종료합니다.");
    }

    /**
     * 지정된 orgId 사용자들에게 SMS와 이메일 알림을 발송합니다.
     * @param orgId 알림을 받을 사용자의 orgId
     * @param production 문제가 발생한 생산량 데이터
     */
    private void sendNotifications(Long orgId, Real production) {
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (orgOpt.isEmpty()) {
            log.error("알림을 보낼 조직(orgId={})을 찾을 수 없습니다.", orgId);
            return;
        }

        Organization org = orgOpt.get();
        
        // 동일 사업자등록번호를 가진 모든 사용자 조회 (ProductionChangeNotifier 로직과 동일)
        List<Organization> users = organizationRepository.findByBizRegNo(org.getBizRegNo());
        
        if (users.isEmpty()) {
            log.warn("조직(orgId={})에 연결된 사용자가 없어 알림을 발송할 수 없습니다.", orgId);
            return;
        }

        // 타임스탬프 포맷 변경 (YYYY-MM-DD HH:mm)
        String occurredAt = production.getTs().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        
        // SMS 메시지
        String smsMessage = String.format("[GENAUH2 긴급] %s 시, 설비(ID: %d)의 수소 생산량이 0으로 감지되었습니다. 즉시 확인이 필요합니다.", 
                                         occurredAt, production.getFacid());

        log.info("조직(orgId={})의 총 {}명의 사용자에게 알림을 발송합니다.", orgId, users.size());

        for (Organization user : users) {
            // SMS 발송
            sendSmsToUser(user, smsMessage);
            
            // 이메일 발송
            sendEmailToUser(user, production, occurredAt);
        }
        try {
            Alarms alarm = new Alarms();
            alarm.setFacilityId(production.getFacid()); 
            alarm.setAlarmType(Alarms.AlarmType.LOW_PRODUCTION);
            alarm.setSeverity(Alarms.Severity.CRITICAL);
            alarm.setReason(String.format("[%s] 설비 ID %d의 수소 생산량 0 감지 - %s", 
                                        occurredAt, production.getFacid(), occurredAt));
            
            alarmsRepository.save(alarm);
            log.info("알람 DB 저장 완료 - 설비 ID: {}", production.getFacid());
        } catch (Exception e) {
            log.error("알람 DB 저장 실패", e);
        }
    }

    /**
     * 개별 사용자에게 SMS를 발송합니다.
     * @param user 수신자 정보
     * @param message SMS 메시지 내용
     */
    private void sendSmsToUser(Organization user, String message) {
        log.info("SMS 발송 체크 - 사용자: {}, SMS설정: {}, 전화번호: {}", 
                 user.getName(), user.isSmsNotification(), user.getPhoneNum());
        
        // SMS 수신 설정이 켜져 있고, 전화번호가 등록되어 있는지 확인
        if (user.isSmsNotification() && user.getPhoneNum() != null && !user.getPhoneNum().isEmpty()) {
            log.info("SMS 발송 조건 충족 - 발송 시도");
            try {
                smsService.sendSms(user.getPhoneNum(), message);
                log.info("SMS 발송 성공: {} ({})", user.getName(), user.getPhoneNum());
            } catch (Exception e) {
                log.error("SMS 발송 실패: {} ({})", user.getName(), user.getPhoneNum(), e);
            }
        } else {
            log.warn("SMS 발송 조건 미충족 - notification: {}, phoneNum: '{}'", 
                     user.isSmsNotification(), user.getPhoneNum());
        }
    }

    /**
     * 개별 사용자에게 이메일을 발송합니다.
     * @param user 수신자 정보
     * @param production 생산량 데이터
     * @param occurredAt 발생 시간 (포맷된 문자열)
     */
    private void sendEmailToUser(Organization user, Real production, String occurredAt) {
        log.info("이메일 발송 체크 - 사용자: {}, 이메일설정: {}, 이메일주소: {}", 
                 user.getName(), user.isEmailNotification(), user.getEmail());
        
        // 이메일 수신 설정이 켜져 있고, 이메일 주소가 등록되어 있는지 확인
        if (user.isEmailNotification() && user.getEmail() != null && !user.getEmail().isEmpty()) {
            log.info("이메일 발송 조건 충족 - 발송 시도");
            try {
                // 이메일 제목
                String subject = String.format("[GENAUH2 긴급] 수소 생산량 0 감지 알림 - %s", occurredAt);
                
                // 이메일 본문
                String emailBody = String.format(
                    "안녕하세요, %s님.\n\n" +
                    "수소 생산량 0이 감지되어 긴급 알림을 보내드립니다.\n\n" +
                    "발생 시간: %s\n" +
                    "설비 ID: %d\n" +
                    "생산량: 0 kg\n\n" +
                    "즉시 설비 점검이 필요합니다.\n" +
                    "빠른 시일 내에 확인해 주시기 바랍니다.\n\n" +
                    "감사합니다.\n" +
                    "GENAUH2 시스템",
                    user.getName(), occurredAt, production.getFacid()
                );
                
                // EmailService를 사용한 이메일 발송
                emailService.sendAlertEmail(user.getEmail(), subject, emailBody);
                log.info("이메일 발송 성공: {} ({})", user.getName(), user.getEmail());
                
            } catch (Exception e) {
                log.error("이메일 발송 실패: {} ({})", user.getName(), user.getEmail(), e);
            }
        } else {
            log.warn("이메일 발송 조건 미충족 - notification: {}, email: '{}'", 
                     user.isEmailNotification(), user.getEmail());
        }
    }
}