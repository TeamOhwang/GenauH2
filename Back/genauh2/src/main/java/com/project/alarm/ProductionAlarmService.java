package com.project.alarm;

import com.project.entity.Organization;
import com.project.entity.Real;
import com.project.repository.OrganizationRepository;
import com.project.repository.RealRepository;
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
    private final DedupGuard dedupGuard; // 중복 발송 방지를 위해 추가

    /**
     * 매 분마다 실행하여 수소 생산량이 0인지 확인하고 알림을 보냅니다.
     * cron = "0 * * * * *" (매분 0초)
     */
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    @Transactional(readOnly = true)
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

                // 3. '발생한 시간'을 기준으로 알림을 보내기 위해 중복 발송 키를 생성합니다. (수정)
                // 키: "alarm:prod-zero:설비ID:타임스탬프" -> 이렇게 하면 각 이벤트마다 고유한 키가 생성됩니다.
                String dedupKey = String.format("alarm:prod-zero:%d:%s", production.getFacid(), production.getTs().toString());

                // 동일한 타임스탬프의 이벤트에 대해 5분 내 중복 알림 방지
                if (dedupGuard.tryOnce(dedupKey, java.time.Duration.ofMinutes(5))) {
                    log.warn("[생산량 오류 감지! 점검이 필요합니다.] 설비 ID: {}, 시간: {}", production.getFacid(), production.getTs());
                    
                    // 4. SMS 알림을 발송합니다.
                    sendSmsNotification(targetOrgId, production); // production 객체 전체를 전달
                } else {
                    log.info("[중복 알림 스킵] 설비 ID {} 의 {} 시점 알림은 이미 발송되었습니다.", production.getFacid(), production.getTs());
                }
            }
        }
        log.info("수소 생산량 0 감지 스케줄러를 종료합니다.");
    }

    /**
     * 지정된 orgId 사용자에게 SMS 알림을 발송합니다.
     * @param orgId 알림을 받을 사용자의 orgId
     * @param production 문제가 발생한 생산량 데이터
     */
    private void sendSmsNotification(Long orgId, Real production) {
        Optional<Organization> userOpt = organizationRepository.findById(orgId);
        if (userOpt.isPresent()) {
            Organization user = userOpt.get();
            // SMS 수신 설정이 켜져 있고, 전화번호가 등록되어 있는지 확인
            if (user.isSmsNotification() && user.getPhoneNum() != null && !user.getPhoneNum().isEmpty()) {
                
                // 타임스탬프 포맷 변경 (YYYY-MM-DD HH:mm)
                String occurredAt = production.getTs().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                
                String message = String.format("[GENAUH2 긴급] %s 시, 설비(ID: %d)의 수소 생산량이 0으로 감지되었습니다. 즉시 확인이 필요합니다.", 
                                               occurredAt, production.getFacid());
                smsService.sendSms(user.getPhoneNum(), message);
            } else {
                log.warn("사용자(orgId={})가 SMS 수신을 동의하지 않았거나 전화번호가 등록되지 않았습니다.", orgId);
            }
        } else {
            log.error("알림을 보낼 사용자(orgId={})를 찾을 수 없습니다.", orgId);
        }
    }
}