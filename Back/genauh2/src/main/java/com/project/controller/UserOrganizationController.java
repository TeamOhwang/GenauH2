package com.project.controller;

import com.project.dto.UserOrganizationDTO;
import com.project.service.UserOrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/userOrgan")
@RequiredArgsConstructor
public class UserOrganizationController {
    
    private final UserOrganizationService userOrganizationService;
    
    // 특정 사용자와 조직 정보 조회
    @GetMapping("/{userId}")
    public ResponseEntity<UserOrganizationDTO> getUser(@PathVariable Long userId) {
        try {
            UserOrganizationDTO user = userOrganizationService.getUserWithOrganization(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 특정 사업자등록번호의 모든 사용자 조회
    @GetMapping("/org/{bizRegNo}")
    public ResponseEntity<List<UserOrganizationDTO>> getUsersByOrg(@PathVariable String bizRegNo) {
        try {
            List<UserOrganizationDTO> users = userOrganizationService.getUsersByBizRegNo(bizRegNo);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 모든 사용자와 조직 정보 조회
    @GetMapping("/all")
    public ResponseEntity<List<UserOrganizationDTO>> getAllUsers() {
        try {
            List<UserOrganizationDTO> users = userOrganizationService.getAllUsersWithOrganizations();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}