package com.project.dto;

import com.project.entity.User;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class UserOrganizationDTO {
    private Long userId;
    private String email;
    private User.Role role;
    private User.Status status;
    private String bizRegNo;

    private Long orgId;            // ✅ 추가
    private String orgname;        // o.orgName
    private String organizationName; // o.name

    private LocalDateTime userCreatedAt;
    private LocalDateTime userUpdatedAt;
    private LocalDateTime orgCreatedAt;
    private LocalDateTime orgUpdatedAt;

    public UserOrganizationDTO(Long userId, String email, User.Role role, User.Status status,
                               String bizRegNo, Long orgId, String orgname, String organizationName,
                               LocalDateTime userCreatedAt, LocalDateTime userUpdatedAt,
                               LocalDateTime orgCreatedAt, LocalDateTime orgUpdatedAt) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.status = status;
        this.bizRegNo = bizRegNo;
        this.orgId = orgId;                 // ✅ 추가
        this.orgname = orgname;
        this.organizationName = organizationName;
        this.userCreatedAt = userCreatedAt;
        this.userUpdatedAt = userUpdatedAt;
        this.orgCreatedAt = orgCreatedAt;
        this.orgUpdatedAt = orgUpdatedAt;
    }
}