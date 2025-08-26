package com.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.entity.Facility;
import com.project.service.FacilityService;

@RestController
@RequestMapping("/plant")
public class FacilitiesController {
    
    @Autowired
    private FacilityService facilityService;
    
    @PostMapping("/insert")
    public ResponseEntity<Map<String, Object>> facInsert(@RequestBody Facility facility) {
        Facility savedFacility = facilityService.saveFacility(facility);
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
            Long facilityId = facility.getFacid();
            if (facilityId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "facilityId는 필수입니다."));
            }
            Facility updatedFacility = facilityService.updateFacility(facilityId, facility);
            return ResponseEntity.ok(Map.of("success", true, "data", updatedFacility));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/delete")
    public ResponseEntity<Map<String, Object>> facDelete(@RequestBody Map<String, Object> request) {
        try {
            Long facilityId = Long.valueOf(request.get("facilityId").toString());
            facilityService.deleteFacility(facilityId);
            return ResponseEntity.ok(Map.of("success", true, "message", "설비가 성공적으로 삭제되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}