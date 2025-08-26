package com.project.service;

import com.project.dto.OrganizationDTO;
import com.project.entity.Organization;
import com.project.repository.OrganizationRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 사용자 로그인
//    public OrganizationDTO login(String email, String password) {
//        Optional<Organization> orgOpt = organizationRepository.findByEmailAndStatus(email, Organization.Status.ACTIVE);
//
//        if (orgOpt.isPresent()) {
//            Organization organization = orgOpt.get();
//
//            // 비밀번호 확인
//            if (passwordEncoder.matches(password, organization.getPasswordHash())) {
//                // 로그인 시간 업데이트
//                organization.setUpdatedAt(LocalDateTime.now());
//                organizationRepository.save(organization);
//
//                return convertToDTO(organization);
//            }
//        }
//
//        return null; // 로그인 실패
//    }

    public OrganizationDTO login(String email, String password) {
        System.out.println("=== 로그인 시도 ===");
        System.out.println("입력된 이메일: " + email);
        System.out.println("입력된 비밀번호: " + password);
        
        Optional<Organization> orgOpt = organizationRepository.findByEmailAndStatus(email, Organization.Status.ACTIVE);
        System.out.println("사용자 조회 결과: " + (orgOpt.isPresent() ? "찾음" : "못찾음"));
        
        if (orgOpt.isPresent()) {
            Organization organization = orgOpt.get();
            System.out.println("찾은 사용자 이메일: " + organization.getEmail());
            System.out.println("저장된 해시: " + organization.getPasswordHash());
            System.out.println("상태: " + organization.getStatus());
            
            boolean passwordMatch = passwordEncoder.matches(password, organization.getPasswordHash());
            System.out.println("비밀번호 매칭 결과: " + passwordMatch);
            
            if (passwordMatch) {
                organization.setUpdatedAt(LocalDateTime.now());
                organizationRepository.save(organization);
                return convertToDTO(organization);
            }
        }
        
        System.out.println("=== 로그인 실패 ===");
        return null;
    }
    
    // 모든 조직/사용자 조회 (상태와 관계없이)
    public List<OrganizationDTO> getAllUsers() {
        List<Organization> organizations = organizationRepository.findAll();
        return organizations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 활성 조직/사용자만 조회
    public List<OrganizationDTO> getActiveUsers() {
        List<Organization> organizations = organizationRepository.findByStatus(Organization.Status.ACTIVE);
        return organizations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 정지된 조직/사용자만 조회
    public List<OrganizationDTO> getSuspendedUsers() {
        List<Organization> organizations = organizationRepository.findByStatus(Organization.Status.SUSPENDED);
        return organizations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 조직 ID로 조회
    public OrganizationDTO getUserById(Long orgId) {
        return organizationRepository.findById(orgId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // 이메일로 사용자 조회
    public OrganizationDTO getUserByEmail(String email) {
        return organizationRepository.findByEmailAndStatus(email, Organization.Status.ACTIVE)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // 조직 및 사용자 생성 (통합)
    @Transactional
    public OrganizationDTO createOrganizationAndUser(
            String orgName,
            String ownerName,
            String bizRegNo,
            String email,
            String rawPassword,
            String phoneNum) {
        
        // 이메일 중복 검사
        if (organizationRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }
        
        // 사업자등록번호 중복 검사 (선택사항)
        if (bizRegNo != null && organizationRepository.existsByBizRegNo(bizRegNo)) {
            throw new RuntimeException("이미 등록된 사업자등록번호입니다.");
        }

        Organization organization = new Organization();
        // 사용자 정보 설정
        organization.setEmail(email);
        organization.setPasswordHash(passwordEncoder.encode(rawPassword));
        organization.setRole(Organization.Role.USER);
        organization.setPhoneNum(phoneNum);
        organization.setStatus(Organization.Status.ACTIVE);
        organization.setEmailNotification(true);
        organization.setSmsNotification(true);
        
        // 조직 정보 설정
        organization.setOrgName(orgName);
        organization.setName(ownerName);
        organization.setBizRegNo(bizRegNo);

        Organization saved = organizationRepository.save(organization);
        return convertToDTO(saved);
    }

    // 사용자 역할 업데이트
    public OrganizationDTO updateUserRole(Long orgId, Organization.Role role) {
        return organizationRepository.findById(orgId).map(organization -> {
            organization.setRole(role);
            return convertToDTO(organizationRepository.save(organization));
        }).orElse(null);
    }

    // 사용자 상태 변경
    public OrganizationDTO updateUserStatus(Long orgId, Organization.Status status) {
        return organizationRepository.findById(orgId).map(organization -> {
            organization.setStatus(status);
            return convertToDTO(organizationRepository.save(organization));
        }).orElse(null);
    }

    // 사용자 비밀번호 변경
    public boolean updateUserPassword(Long orgId, String newPassword) {
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);

        if (orgOpt.isPresent()) {
            Organization organization = orgOpt.get();
            
            // 새 비밀번호를 해싱하여 저장
            organization.setPasswordHash(passwordEncoder.encode(newPassword));
            organization.setUpdatedAt(LocalDateTime.now());
            
            organizationRepository.save(organization);
            return true;
        }

        return false;
    }

    // 사용자 정지
    public boolean suspendUser(Long orgId) {
        return organizationRepository.findById(orgId).map(organization -> {
            organization.setStatus(Organization.Status.SUSPENDED);
            organizationRepository.save(organization);
            return true;
        }).orElse(false);
    }

    // 사업자등록번호별 사용자 조회
    public List<OrganizationDTO> getUsersByOrg(String bizRegNo) {
        return organizationRepository.findByBizRegNoAndStatus(bizRegNo, Organization.Status.ACTIVE)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Entity를 DTO로 변환
    private OrganizationDTO convertToDTO(Organization organization) {
        return new OrganizationDTO(
                organization.getOrgId(),
                organization.getEmail(),
                organization.getRole(),
                organization.getPhoneNum(),
                organization.getStatus(),
                organization.isEmailNotification(),
                organization.isSmsNotification(),
                organization.getOrgName(),
                organization.getName(),
                organization.getBizRegNo(),
                organization.getCreatedAt(),
                organization.getUpdatedAt());
    }

    public List<OrganizationDTO> searchUsers(String keyword) {
        // TODO: 검색 로직 구현
        return null;
    }

    // 사용자 삭제 (관리자 전용)
    @Transactional
    public boolean deleteUsers(List<?> orgIds) {
        System.out.println("=== OrganizationService.deleteUsers 시작 ===");
        System.out.println("입력받은 orgIds: " + orgIds);
        System.out.println("orgIds 크기: " + (orgIds != null ? orgIds.size() : "null"));

        try {
            System.out.println("삭제 요청된 조직 ID 목록: " + orgIds);

            for (Object orgIdObj : orgIds) {
                try {
                    System.out.println("--- 조직 ID " + orgIdObj + " 처리 시작 ---");
                    System.out.println("orgIdObj 타입: " + orgIdObj.getClass().getSimpleName());

                    Long orgId;
                    if (orgIdObj instanceof Integer) {
                        orgId = ((Integer) orgIdObj).longValue();
                    } else if (orgIdObj instanceof String) {
                        orgId = Long.parseLong((String) orgIdObj);
                    } else {
                        orgId = Long.parseLong(orgIdObj.toString());
                    }

                    System.out.println("변환된 orgId: " + orgId + " (타입: " + orgId.getClass().getSimpleName() + ")");
                    System.out.println("조직 ID " + orgId + " 처리 중...");

                    Optional<Organization> orgOpt = organizationRepository.findById(orgId);
                    System.out.println("조직 조회 결과: " + (orgOpt.isPresent() ? "찾음" : "못찾음"));

                    if (orgOpt.isPresent()) {
                        Organization organization = orgOpt.get();
                        System.out.println("조직 찾음: " + organization.getEmail() + ", 현재 상태: " + organization.getStatus());

                        // 실제 삭제 대신 상태를 SUSPENDED로 변경 (소프트 삭제)
                        try {
                            System.out.println("조직 상태 변경 전: " + organization.getStatus());
                            organization.setStatus(Organization.Status.SUSPENDED);
                            System.out.println("상태 변경 완료: " + organization.getStatus());

                            System.out.println("organizationRepository.save 호출 전...");
                            Organization savedOrg = organizationRepository.save(organization);
                            System.out.println("organizationRepository.save 호출 완료");
                            System.out.println("조직 상태 업데이트 완료: " + savedOrg.getStatus());
                        } catch (Exception saveException) {
                            System.err.println("조직 저장 중 오류: " + saveException.getMessage());
                            System.err.println("저장 오류 타입: " + saveException.getClass().getSimpleName());
                            System.err.println("저장 오류 상세:");
                            saveException.printStackTrace();

                            if (saveException.getCause() != null) {
                                System.err.println("원인 예외: " + saveException.getCause().getMessage());
                                System.err.println("원인 예외 타입: " + saveException.getCause().getClass().getSimpleName());
                            }

                            throw saveException;
                        }
                    } else {
                        System.out.println("조직 ID " + orgId + "를 찾을 수 없음");
                    }
                    System.out.println("--- 조직 ID " + orgIdObj + " 처리 완료 ---");
                } catch (NumberFormatException e) {
                    System.err.println("잘못된 조직 ID 형식: " + orgIdObj);
                    e.printStackTrace();
                    throw e;
                } catch (Exception e) {
                    System.err.println("조직 ID " + orgIdObj + " 처리 중 오류: " + e.getMessage());
                    System.err.println("오류 타입: " + e.getClass().getSimpleName());
                    e.printStackTrace();
                    throw e;
                }
            }
            System.out.println("=== OrganizationService.deleteUsers 성공 완료 ===");
            return true;
        } catch (Exception e) {
            System.err.println("deleteUsers 메서드에서 예외 발생: " + e.getMessage());
            System.err.println("예외 타입: " + e.getClass().getSimpleName());
            System.err.println("예외 스택트레이스:");
            e.printStackTrace();
            return false;
        }
    }
}