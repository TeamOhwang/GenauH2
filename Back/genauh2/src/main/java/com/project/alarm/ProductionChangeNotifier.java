package com.project.alarm;

import com.project.entity.Facility;
import com.project.entity.HydrogenActual;
import com.project.entity.PlantGeneration;
import com.project.entity.User;
import com.project.repository.FacilityRepository;
import com.project.repository.HydrogenActualRepository;
import com.project.repository.OrganizationRepository;
import com.project.repository.PlantGenerationRepository;
import com.project.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final SmsService smsService;

    @Value("${alert.power-drop-kwh:200.0}")
    private double powerDropThreshold;

    @Value("${alert.hydrogen-drop-kgh:50.0}")
    private double hydrogenDropThreshold;

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

    private void checkPowerGeneration(Facility facility, LocalDateTime now) {
        // 변경: getFacilityId() → getFacid()
        String plantId = "plt" + String.format("%03d", facility.getFacid());

        Optional<PlantGeneration> currentGenOpt = plantGenerationRepository.findByPlantIdAndDateAndHour(plantId, now.toLocalDate(), now.getHour());
        Optional<PlantGeneration> previousGenOpt = plantGenerationRepository.findByPlantIdAndDateAndHour(plantId, now.minusHours(1).toLocalDate(), now.minusHours(1).getHour());

        if (currentGenOpt.isPresent() && previousGenOpt.isPresent()) {
            double currentPower = currentGenOpt.get().getGeneration_Kw();
            double previousPower = previousGenOpt.get().getGeneration_Kw();
            double drop = previousPower - currentPower;

            if (drop >= powerDropThreshold) {
                // 변경: getFacilityId() → getFacid()
                log.warn("[태양광 발전량 급감] 설비 ID: {}, 변화량: {:.2f} kWh", facility.getFacid(), drop);
                String message = String.format("[발전량 경고] '%s'의 발전량이 1시간 전 대비 %.0f kWh 감소했습니다. (현재: %.0f kWh)",
                        facility.getName(), drop, currentPower);
                sendNotifications(facility, message);
            }
        }
    }

    private void checkHydrogenProduction(Facility facility, LocalDateTime now) {
        LocalDateTime currentHourStart = now.withMinute(0).withSecond(0).withNano(0);
        LocalDateTime previousHourStart = currentHourStart.minusHours(1);

        // 변경: getFacilityId() → getFacid()
        Optional<HydrogenActual> currentProdOpt = hydrogenActualRepository.findTopByFacilityIdAndTsBetweenOrderByTsDesc(facility.getFacid(), currentHourStart, now);
        Optional<HydrogenActual> previousProdOpt = hydrogenActualRepository.findTopByFacilityIdAndTsBetweenOrderByTsDesc(facility.getFacid(), previousHourStart, currentHourStart);

        if (currentProdOpt.isPresent() && previousProdOpt.isPresent()) {
            double currentProduction = currentProdOpt.get().getProductionKg().doubleValue();
            double previousProduction = previousProdOpt.get().getProductionKg().doubleValue();
            double drop = previousProduction - currentProduction;

            if (drop >= hydrogenDropThreshold) {
                // 변경: getFacilityId() → getFacid()
                log.warn("[수소 생산량 급감] 설비 ID: {}, 변화량: {:.2f} kg", facility.getFacid(), drop);
                String message = String.format("[수소생산량 경고] '%s'의 생산량이 1시간 전 대비 %.0f kg 감소했습니다. (현재: %.0f kg)",
                        facility.getName(), drop, currentProduction);
                sendNotifications(facility, message);
            }
        }
    }

    private void sendNotifications(Facility facility, String message) {
        // 변경: getOrgId() → getOrgid()
        organizationRepository.findById(facility.getOrgid()).ifPresent(organization -> {
            List<User> users = userRepository.findByBizRegNo(organization.getBizRegNo());
            
            if (users.isEmpty()) {
                log.warn("'{}' 설비(조직: {})에 연결된 사용자가 없어 SMS를 발송할 수 없습니다.", facility.getName(), organization.getOrgName());
                return;
            }

            log.info("'{}' 설비에 변경사항이 감지되어 총 {}명에게 SMS를 발송합니다.", facility.getName(), users.size());
            for (User user : users) {
                smsService.sendSms(user.getPhoneNum(), message);
            }
        });
    }
}