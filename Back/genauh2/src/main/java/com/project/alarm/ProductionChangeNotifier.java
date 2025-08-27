package com.project.alarm;

import com.project.entity.Facility;
import com.project.entity.HydrogenActual;
import com.project.entity.PlantGeneration;
import com.project.entity.Organization;
import com.project.repository.FacilityRepository;
import com.project.repository.HydrogenActualRepository;
import com.project.repository.OrganizationRepository;
import com.project.repository.PlantGenerationRepository;
import com.project.service.Sms.SmsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Component
@RequiredArgsConstructor
@Slf4j
public class ProductionChangeNotifier {
    private final FacilityRepository facilityRepository;
    private final PlantGenerationRepository plantGenerationRepository;
    private final HydrogenActualRepository hydrogenActualRepository;
    private final OrganizationRepository organizationRepository;
    private final SmsService smsService;

    @Value("${alert.power-change-kwh:200.0}")
    private double powerChangeThreshold;

    @Value("${alert.hydrogen-change-kgh:50.0}")
    private double hydrogenChangeThreshold;

    // 1시간마다 실행 (매시 정각)
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    @Transactional(readOnly = true)
    public void checkProductionChanges() {
        log.info("🚀 생산량 변화 감지 스케줄러 시작...");
        LocalDateTime now = LocalDateTime.now();
        
        List<Facility> facilities = facilityRepository.findAll();
        if (facilities.isEmpty()) {
            log.warn("감지할 설비가 등록되어 있지 않습니다.");
            return;
        }

        for (Facility facility : facilities) {
            checkPowerGeneration(facility, now);
            checkHydrogenProduction(facility, now);
        }
        log.info("✅ 생산량 변화 감지 스케줄러 종료.");
    }

    // 발전량 급감 체크
    private void checkPowerGeneration(Facility facility, LocalDateTime now) {
        // ID 필드명이 facId로 변경됨
        String plantId = "plt" + String.format("%03d", facility.getFacId());

        // 현재 시간과 1시간 전 데이터 조회
        Optional<PlantGeneration> currentGenOpt = plantGenerationRepository.findByPlantIdAndDateAndHour(plantId, now.toLocalDate(), now.getHour());
        Optional<PlantGeneration> previousGenOpt = plantGenerationRepository.findByPlantIdAndDateAndHour(plantId, now.minusHours(1).toLocalDate(), now.minusHours(1).getHour());

        if (currentGenOpt.isPresent() && previousGenOpt.isPresent()) {
            double currentPower = currentGenOpt.get().getGeneration_Kw();
            double previousPower = previousGenOpt.get().getGeneration_Kw();
            double change = currentPower - previousPower;

            if (Math.abs(change) >= powerChangeThreshold) {
                // ID 필드명이 facId로 변경됨
                String status = change > 0 ? "증가" : "감소";
                log.warn("[태양광 발전량 급감] 설비 ID: {}, 변화량: {:.2f} kWh", facility.getFacId(), change);
                
                String message = String.format("[발전량 %s] '%s'의 발전량이 1시간 전 대비 %.0f kWh %s했습니다. (현재: %.0f kWh)",
                        status, facility.getName(), Math.abs(change), status, currentPower);
                
                sendNotifications(facility, message);
            }
        }
    }

    private void checkHydrogenProduction(Facility facility, LocalDateTime now) {
        LocalDateTime currentHourStart = now.withMinute(0).withSecond(0).withNano(0);
        LocalDateTime previousHourStart = currentHourStart.minusHours(1);

        // ID 필드명이 facId로 변경됨
        Optional<HydrogenActual> currentProdOpt = hydrogenActualRepository.findTopByFacilityIdAndTsBetweenOrderByTsDesc(facility.getFacId(), currentHourStart, now);
        Optional<HydrogenActual> previousProdOpt = hydrogenActualRepository.findTopByFacilityIdAndTsBetweenOrderByTsDesc(facility.getFacId(), previousHourStart, currentHourStart);

        if (currentProdOpt.isPresent() && previousProdOpt.isPresent()) {
            double currentProduction = currentProdOpt.get().getProductionKg().doubleValue();
            double previousProduction = previousProdOpt.get().getProductionKg().doubleValue();
            double change = currentProduction - previousProduction;

            if (Math.abs(change) >= hydrogenChangeThreshold) {
                // ID 필드명이 facId로 변경됨
                String status = change > 0 ? "증가" : "감소";
                log.warn("[수소 생산량 급감] 설비 ID: {}, 변화량: {:.2f} kg", facility.getFacId(), change);
                
                String message = String.format("[수소생산량 %s] '%s'의 생산량이 1시간 전 대비 %.1f kg %s했습니다. (현재: %.1f kg)",
                        status, facility.getName(), Math.abs(change), status, currentProduction);
                sendNotifications(facility, message);
            }
        }
    }

    private void sendNotifications(Facility facility, String message) {
        // ID 필드명이 orgId로 변경됨
        organizationRepository.findById(facility.getOrgId()).ifPresent(organization -> {
            List<Organization> users = organizationRepository.findByBizRegNo(organization.getBizRegNo());
            
            if (users.isEmpty()) {
                log.warn("'{}' 설비(조직: {})에 연결된 사용자가 없어 SMS를 발송할 수 없습니다.", facility.getName(), organization.getOrgName());
                return;
            }

            // SMS 수신 설정이 켜진 사용자에게만 발송하도록 변경
            List<Organization> subscribedUsers = users.stream()
                                              .filter(Organization::isSmsNotification)
                                              .toList();

            if (subscribedUsers.isEmpty()) {
                log.info("'{}' 설비의 모든 사용자가 SMS 알림을 비활성화하여 발송하지 않습니다.", facility.getName());
                return;
            }

            log.info("'{}' 설비에 변경사항이 감지되어 총 {}명에게 SMS를 발송합니다.", facility.getName(), subscribedUsers.size());
            for (Organization user : subscribedUsers) {
                smsService.sendSms(user.getPhoneNum(), message);
            }
        });
    }
}