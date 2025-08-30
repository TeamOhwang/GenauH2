package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "orgId", columnDefinition = "BIGINT UNSIGNED COMMENT '조직 고유 번호'")
    private Long orgId;
    
    // 사용자 관련 컬럼들
    @Column(nullable = false, columnDefinition = "VARCHAR(255) COMMENT '사용자 이메일'")
    private String email;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) COMMENT '암호화된 비밀번호'")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('SUPERVISOR','USER') COMMENT '사용자 역할'")
    private Role role;

    @Column(name = "phoneNum", length = 20, columnDefinition = "VARCHAR(20) COMMENT '전화번호'")
    private String phoneNum;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('INVITED','ACTIVE','SUSPENDED') COMMENT '계정 상태'")
    private Status status = Status.ACTIVE;
    
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1 COMMENT '이메일 알림 설정'")
    private boolean emailNotification = true;
    
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 1 COMMENT 'SMS 알림 설정'")
    private boolean smsNotification = true;
    
    // 조직 관련 컬럼들
    @Column(nullable = false, columnDefinition = "VARCHAR(200) COMMENT '조직명'")
    private String orgName;
    
    @Column(nullable = false, columnDefinition = "VARCHAR(200) COMMENT '대표자명'")
    private String name;
    
    // 공통 컬럼
    @Column(columnDefinition = "VARCHAR(20) COMMENT '사업자등록번호'")
    private String bizRegNo;
    
    @Column(nullable = false, updatable = false, columnDefinition = "DATETIME COMMENT '생성일시'")
    private LocalDateTime createdAt;
    
    @Column(insertable = false, columnDefinition = "DATETIME COMMENT '수정일시'")
    private LocalDateTime updatedAt;
    
    public enum Role {
        SUPERVISOR, USER
    }

    public enum Status {
        INVITED, ACTIVE, SUSPENDED
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getter/Setter 메서드들
    public void setStatus(Status status) {
        this.status = status;
    }

    public Status getStatus() {
        return this.status;
    }

    public void setOrgId(Long orgId) {
        this.orgId = orgId;
    }

    public Long getOrgId() {
        return this.orgId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return this.email;
    }

    public void setBizRegNo(String bizRegNo) {
        this.bizRegNo = bizRegNo;
    }

    public String getBizRegNo() {
        return this.bizRegNo;
    }

    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }

    public String getPhoneNum() {
        return this.phoneNum;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPasswordHash() {
        return this.passwordHash;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }

    public Role getRole() {
        return this.role;
    }
    
    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getOrgName() {
        return this.orgName;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
    
    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}