package com.project.service;

import com.project.dto.UserOrganizationDTO;
import com.project.repository.UserOrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserOrganizationService {
    
    private final UserOrganizationRepository userOrganizationRepository;
    
    public UserOrganizationDTO getUserWithOrganization(Long userId) {
        return userOrganizationRepository.findUserWithOrganization(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }
    
    public List<UserOrganizationDTO> getUsersByBizRegNo(String bizRegNo) {
        return userOrganizationRepository.findUsersByBizRegNo(bizRegNo);
    }
    
    public List<UserOrganizationDTO> getAllUsersWithOrganizations() {
        return userOrganizationRepository.findAllUsersWithOrganizations();
    }
}