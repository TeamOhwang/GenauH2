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
        if (facilityDetails.getModelNo() != null) {
            existingFacility.setModelNo(facilityDetails.getModelNo());
        }
        if (facilityDetails.getCellCount() != null) {
            existingFacility.setCellCount(facilityDetails.getCellCount());
        }
        if (facilityDetails.getRatedPowerKw() != null) {
            existingFacility.setRatedPowerKw(facilityDetails.getRatedPowerKw());
        }
        if (facilityDetails.getRatedOutputKgH() != null) {
            existingFacility.setRatedOutputKgH(facilityDetails.getRatedOutputKgH());
        }
        if (facilityDetails.getSecNominalKwhPerKg() != null) {
            existingFacility.setSecNominalKwhPerKg(facilityDetails.getSecNominalKwhPerKg());
        }
        if (facilityDetails.getCatalystInstallDate() != null) {
            existingFacility.setCatalystInstallDate(facilityDetails.getCatalystInstallDate());
        }
        if (facilityDetails.getCatalystLifeHours() != null) {
            existingFacility.setCatalystLifeHours(facilityDetails.getCatalystLifeHours());
        }
        if (facilityDetails.getLocation() != null) {
            existingFacility.setLocation(facilityDetails.getLocation());
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