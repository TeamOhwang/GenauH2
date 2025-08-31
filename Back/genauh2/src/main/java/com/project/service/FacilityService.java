package com.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.entity.ActivityLog;
import com.project.entity.Facility;
import com.project.repository.FacilityRepository;

@Service
public class FacilityService {
    
    @Autowired
    private FacilityRepository facilityRepository;
    
    @Autowired
    private ActivityLogService activityLogService;
    
    public Facility saveFacility(Facility facility, jakarta.servlet.http.HttpServletRequest request) {
        Facility savedFacility = facilityRepository.save(facility);
        
        // 설비 추가 활동 로그 생성
        try {
            activityLogService.createUserActivityLog(
                ActivityLog.ActivityType.FACILITY_ADD,
                facility.getOrgId(),
                "USER", // 사용자 이름은 별도로 전달받아야 함
                "USER", // 사용자 역할은 별도로 전달받아야 함
                "새로운 설비 추가: " + facility.getName(),
                request
            );
        } catch (Exception e) {
            // 로그 생성 실패는 설비 저장에 영향을 주지 않도록 함
        }
        
        return savedFacility;
    }
    
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }
    
    public List<Facility> getFacilitiesByOrgId(Long orgId) {
        return facilityRepository.findByOrgId(orgId);
    }
    
    public Facility getFacilityById(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("ID " + facilityId + "에 해당하는 설비를 찾을 수 없습니다."));
    }
    
    public Facility updateFacility(Long facilityId, Facility facilityDetails, jakarta.servlet.http.HttpServletRequest request) {
        Facility existingFacility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("ID " + facilityId + "에 해당하는 설비를 찾을 수 없습니다."));
        
        if (facilityDetails.getOrgId() != null) {
            existingFacility.setOrgId(facilityDetails.getOrgId());
        }
        if (facilityDetails.getName() != null) {
            existingFacility.setName(facilityDetails.getName());
        }
        if (facilityDetails.getType() != null) {
            existingFacility.setType(facilityDetails.getType());
        }
        if (facilityDetails.getMaker() != null) {
            existingFacility.setMaker(facilityDetails.getMaker());
        }
        if (facilityDetails.getModel() != null) {
            existingFacility.setModel(facilityDetails.getModel());
        }
        if (facilityDetails.getPowerKw() != null) {
            existingFacility.setPowerKw(facilityDetails.getPowerKw());
        }
        if (facilityDetails.getH2Rate() != null) {
            existingFacility.setH2Rate(facilityDetails.getH2Rate());
        }
        if (facilityDetails.getSpecKwh() != null) {
            existingFacility.setSpecKwh(facilityDetails.getSpecKwh());
        }
        if (facilityDetails.getPurity() != null) {
            existingFacility.setPurity(facilityDetails.getPurity());
        }
        if (facilityDetails.getPressure() != null) {
            existingFacility.setPressure(facilityDetails.getPressure());
        }
        if (facilityDetails.getLocation() != null) {
            existingFacility.setLocation(facilityDetails.getLocation());
        }
        if (facilityDetails.getInstall() != null) {
            existingFacility.setInstall(facilityDetails.getInstall());
        }
        
        Facility updatedFacility = facilityRepository.save(existingFacility);
        
        // 설비 수정 활동 로그 생성
        try {
            activityLogService.createUserActivityLog(
                ActivityLog.ActivityType.FACILITY_UPDATE,
                existingFacility.getOrgId(),
                "USER", // 사용자 이름은 별도로 전달받아야 함
                "USER", // 사용자 역할은 별도로 전달받아야 함
                "설비 수정: " + existingFacility.getName(),
                request
            );
        } catch (Exception e) {
            // 로그 생성 실패는 설비 수정에 영향을 주지 않도록 함
        }
        
        return updatedFacility;
    }
    
    public void deleteFacility(Long facilityId, jakarta.servlet.http.HttpServletRequest request) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("ID " + facilityId + "에 해당하는 설비를 찾을 수 없습니다."));
        
        // 설비 삭제 활동 로그 생성
        try {
            activityLogService.createUserActivityLog(
                ActivityLog.ActivityType.FACILITY_DELETE,
                facility.getOrgId(),
                "USER", // 사용자 이름은 별도로 전달받아야 함
                "USER", // 사용자 역할은 별도로 전달받아야 함
                "설비 삭제: " + facility.getName(),
                request
            );
        } catch (Exception e) {
            // 로그 생성 실패는 설비 삭제에 영향을 주지 않도록 함
        }
        
        facilityRepository.deleteById(facilityId);
    }
}