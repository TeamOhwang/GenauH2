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
}