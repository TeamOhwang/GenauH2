package com.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dto.OrganizationDTO;
import com.project.entity.AuditLog;
import com.project.entity.Facility;
import com.project.service.AuditLogService;
import com.project.service.FacilityService;
import com.project.service.OrganizationService;

@RestController
@RequestMapping("/plant")
public class FacilitiesController {
    
    @Autowired
    private FacilityService facilityService;
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private OrganizationService organizationService;
    
    @PostMapping("/insert")
    public ResponseEntity<Map<String, Object>> facInsert(@RequestBody Facility facility) {
        Facility savedFacility = facilityService.saveFacility(facility);
        
        // 시설 추가 감사 로그 기록
        try {
            String currentUserName = getCurrentUserName();
            AuditLog facilityCreateLog = AuditLog.createFacilityCreateLog(
                facility.getOrgId(), 
                currentUserName,
                savedFacility.getFacId(), 
                savedFacility.getName()
            );
            auditLogService.saveAuditLog(facilityCreateLog);
        } catch (Exception logException) {
            System.err.println("시설 추가 감사 로그 기록 실패: " + logException.getMessage());
        }
        
        return ResponseEntity.ok(Map.of("success", true, "data", savedFacility));
    }
    
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> facList(@RequestParam(required = false) Long orgId) {
        List<Facility> facilities;
        
        if (orgId != null) {
            facilities = facilityService.getFacilitiesByOrgId(orgId);
        } else {
            facilities = facilityService.getAllFacilities();
        }
        
        return ResponseEntity.ok(Map.of("success", true, "data", facilities));
    }
    
    @GetMapping("/detail")
    public ResponseEntity<Map<String, Object>> facDetail(@RequestParam Long facilityId) {
        try {
            Facility facility = facilityService.getFacilityById(facilityId);
            return ResponseEntity.ok(Map.of("success", true, "data", facility));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> facUpdate(@RequestBody Facility facility) {
        try {
            Long facilityId = facility.getFacId();
            if (facilityId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "facilityId는 필수입니다."));
            }
            Facility updatedFacility = facilityService.updateFacility(facilityId, facility);
            
            // 시설 수정 감사 로그 기록
            try {
                String currentUserName = getCurrentUserName();
                AuditLog facilityUpdateLog = AuditLog.createFacilityUpdateLog(
                    facility.getOrgId(), 
                    currentUserName,
                    updatedFacility.getFacId(), 
                    updatedFacility.getName()
                );
                auditLogService.saveAuditLog(facilityUpdateLog);
            } catch (Exception logException) {
                System.err.println("시설 수정 감사 로그 기록 실패: " + logException.getMessage());
            }
            
            return ResponseEntity.ok(Map.of("success", true, "data", updatedFacility));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/delete")
    public ResponseEntity<Map<String, Object>> facDelete(@RequestBody Map<String, Object> request) {
        try {
            Long facilityId = Long.valueOf(request.get("facilityId").toString());
            
            // 삭제 전 시설 정보 조회 (로그용)
            Facility facilityToDelete = facilityService.getFacilityById(facilityId);
            
            facilityService.deleteFacility(facilityId);
            
            // 시설 삭제 감사 로그 기록
            try {
                if (facilityToDelete != null) {
                    String currentUserName = getCurrentUserName();
                    AuditLog facilityDeleteLog = AuditLog.createFacilityDeleteLog(
                        facilityToDelete.getOrgId(), 
                        currentUserName,
                        facilityToDelete.getFacId(), 
                        facilityToDelete.getName()
                    );
                    auditLogService.saveAuditLog(facilityDeleteLog);
                }
            } catch (Exception logException) {
                System.err.println("시설 삭제 감사 로그 기록 실패: " + logException.getMessage());
            }
            
            return ResponseEntity.ok(Map.of("success", true, "message", "설비가 성공적으로 삭제되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // 현재 사용자 이름을 가져오는 헬퍼 메서드
    private String getCurrentUserName() {
        try {
            // SecurityContext에서 인증 정보 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // 인증 정보가 없거나, 인증되지 않았거나, 익명 사용자인 경우
            if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
                return "System";
            }
            
            // Principal에서 사용자 ID(문자열)를 가져와 Long으로 변환
            String userIdStr = (String) authentication.getPrincipal();
            Long userId = Long.valueOf(userIdStr);
            
            // 사용자 정보 조회
            OrganizationDTO user = organizationService.getUserById(userId);
            if (user != null) {
                return user.getName();
            }
            
            return "System";
        } catch (NumberFormatException | SecurityException e) {
            System.err.println("현재 사용자 이름 조회 실패: " + e.getMessage());
            return "System";
        }
    }
}