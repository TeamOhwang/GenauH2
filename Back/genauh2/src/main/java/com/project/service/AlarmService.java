package com.project.service;

import com.project.entity.Alarms;
import com.project.repository.AlarmsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlarmService {

    private final AlarmsRepository alarmsRepository;

    
    // 사용자를 위한 알림 규칙 관련 CRUD 메소드들
    public List<Alarms> getAlarmsByFacilityId(Long facilityId) {
        return alarmsRepository.findByFacilityId(facilityId);
    }
    
   public Alarms createAlarm(Alarms alarm) {
        return alarmsRepository.save(alarm);
    }
}