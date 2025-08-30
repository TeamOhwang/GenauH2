package com.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.entity.Organization;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
    // 이메일로 사용자 찾기
    Optional<Organization> findByEmail(String email);
    
    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);
    
    // 활성 사용자만 조회 (ACTIVE 상태)
    List<Organization> findByStatus(Organization.Status status);
    
    // 역할별 사용자 조회
    List<Organization> findByRole(Organization.Role role);
    
    // 사업자등록번호로 조직 조회
    List<Organization> findByBizRegNo(String bizRegNo);
    
    // 사업자등록번호 존재 여부 확인
    boolean existsByBizRegNo(String bizRegNo);
    
    // 이메일과 활성 상태로 사용자 찾기
    Optional<Organization> findByEmailAndStatus(String email, Organization.Status status);
    
    // 사업자등록번호와 상태로 사용자 조회
    List<Organization> findByBizRegNoAndStatus(String bizRegNo, Organization.Status status);
    
    // 역할과 상태로 사용자 조회
    List<Organization> findByRoleAndStatus(Organization.Role role, Organization.Status status);
    
    // 조직명으로 조회
    List<Organization> findByOrgName(String orgName);
    
    // 조직명과 상태로 조회
    List<Organization> findByOrgNameAndStatus(String orgName, Organization.Status status);
    
    // 상태별 사용자 수 카운트
    long countByStatus(Organization.Status status);
}