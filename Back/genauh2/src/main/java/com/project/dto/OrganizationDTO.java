package com.project.dto;

import com.project.entity.Organization;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDTO {
    private Long orgId;
    
    // 사용자 관련 필드
    private String email;
    private Organization.Role role;
    private String phoneNum;
    private Organization.Status status;
    private boolean emailNotification;
    private boolean smsNotification;
    
    // 조직 관련 필드
    private String orgName;
    private String name;
    private String bizRegNo;
    
    // 공통 필드
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}