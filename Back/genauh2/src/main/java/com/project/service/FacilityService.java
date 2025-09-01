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
    
    public Facility getFacilityById(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("ID " + facilityId + "에 해당하는 설비를 찾을 수 없습니다."));
    }
    
    public Facility updateFacility(Long facilityId, Facility facilityDetails) {
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
        
        return facilityRepository.save(existingFacility);
    }
    
    public void deleteFacility(Long facilityId) {
        if (!facilityRepository.existsById(facilityId)) {
            throw new RuntimeException("ID " + facilityId + "에 해당하는 설비를 찾을 수 없습니다.");
        }
        facilityRepository.deleteById(facilityId);
    }
}