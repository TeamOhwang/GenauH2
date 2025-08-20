package com.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.entity.Facility;
import com.project.repository.FacilityRepository;

@Service
public class FacilityService {
    
    @Autowired
    private FacilityRepository facilityRepository;
    
    public Facility saveFacility(Facility facility) {
        return facilityRepository.save(facility);
    }
    
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }
    
    public List<Facility> getFacilitiesByOrgId(Long orgId) {
        return facilityRepository.findByOrgId(orgId);
    }
}