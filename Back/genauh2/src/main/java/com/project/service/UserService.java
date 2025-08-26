package com.project.service;

import com.project.dto.UserDTO;
import com.project.entity.User;
import com.project.entity.Organization;
import com.project.repository.OrganizationRepository;
import com.project.repository.UserRepository;
import com.project.dto.NotificationSettingsDTO; // 알림설정

import org.springframework.transaction.annotation.Transactional; // 알림설정
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OrganizationRepository organizationRepository;

    // 사용자 로그인
    public UserDTO login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmailAndStatus(email, User.Status.ACTIVE);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 비밀번호 확인
            if (passwordEncoder.matches(password, user.getPasswordHash())) {
                // 로그인 시간 업데이트
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);

                return convertToDTO(user);
            }
        }

        return null; // 로그인 실패
    }

    // 모든 사용자 조회 (상태와 관계없이)
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 활성 사용자만 조회
    public List<UserDTO> getActiveUsers() {
        List<User> users = userRepository.findByStatus(User.Status.ACTIVE);
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 정지된 사용자만 조회
    public List<UserDTO> getSuspendedUsers() {
        List<User> users = userRepository.findByStatus(User.Status.SUSPENDED);
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 사용자 ID로 조회
    public UserDTO getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // 이메일로 사용자 조회
    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmailAndStatus(email, User.Status.ACTIVE)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // 사용자 생성
    // orgId 대신 bizRegNo를 사용하도록 매개변수 수정
    public UserDTO createUser(String email, String password, User.Role role, String phoneNum, String bizRegNo) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setPhoneNum(phoneNum);
        // orgId 대신 bizRegNo를 설정
        user.setBizRegNo(bizRegNo);
        user.setStatus(User.Status.ACTIVE);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }


    // 사용자 역할 업데이트
    public UserDTO updateUserRole(Long userId, User.Role role) {
        return userRepository.findById(userId).map(user -> {
            user.setRole(role);
            return convertToDTO(userRepository.save(user));
        }).orElse(null);
    }

    // 사용자 상태 변경
    public UserDTO updateUserStatus(Long userId, User.Status status) {
        return userRepository.findById(userId).map(user -> {
            user.setStatus(status);
            return convertToDTO(userRepository.save(user));
        }).orElse(null);
    }

    // 사용자 비밀번호 변경
    public boolean updateUserPassword(Long userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // 새 비밀번호를 해싱하여 저장
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            return true;
        }

        return false;
    }

    // 사용자 정지
    public boolean suspendUser(Long userId) {
        return userRepository.findById(userId).map(user -> {
            user.setStatus(User.Status.SUSPENDED);
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    // 조직별 사용자 조회
    // orgId 대신 bizRegNo를 사용하도록 매개변수 및 로직 수정
    public List<UserDTO> getUsersByOrg(String bizRegNo) {
        return userRepository.findByBizRegNoAndStatus(bizRegNo, User.Status.ACTIVE)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Entity를 DTO로 변환
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getUserId(),
                user.getBizRegNo(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNum(),
                user.getStatus(),
                user.isEmailNotification(), // 이메일알림
                user.isSmsNotification(),   // SMS알림
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    public List<UserDTO> searchUsers(String keyword) {

        return null;
    }

    // 조직 + 사용자 동시 등록 (관리자 전용)
    @Transactional
    public UserDTO createOrganizationAndUser(
            String orgName,
            String ownerName,
            String bizRegNo,
            String email,
            String rawPassword,
            String phoneNum
            ) {
        // 조직 존재 여부 확인 후 없으면 생성
        if (!organizationRepository.existsByBizRegNo(bizRegNo)) {
            Organization organization = new Organization();
            organization.setBizRegNo(bizRegNo);
            organization.setOrgName(orgName);
            organization.setName(ownerName);
            organizationRepository.save(organization);
        }

        // 이메일 중복 검사
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }

        // 사용자 생성: role=USER, status=ACTIVE, bizRegNo 참조
        User user = new User();
        user.setBizRegNo(bizRegNo);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(User.Role.USER);
        user.setPhoneNum(phoneNum);
        user.setStatus(User.Status.ACTIVE);

        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }

    // 사용자 삭제 (관리자 전용)
    @org.springframework.transaction.annotation.Transactional
    public boolean deleteUsers(List<?> userIds) {
        System.out.println("=== UserService.deleteUsers 시작 ===");
        System.out.println("입력받은 userIds: " + userIds);
        System.out.println("userIds 크기: " + (userIds != null ? userIds.size() : "null"));

        try {
            System.out.println("삭제 요청된 사용자 ID 목록: " + userIds);

            for (Object userIdObj : userIds) {
                try {
                    System.out.println("--- 사용자 ID " + userIdObj + " 처리 시작 ---");
                    System.out.println("userIdObj 타입: " + userIdObj.getClass().getSimpleName());

                    Long userId;
                    if (userIdObj instanceof Integer) {
                        userId = ((Integer) userIdObj).longValue();
                    } else if (userIdObj instanceof String) {
                        userId = Long.parseLong((String) userIdObj);
                    } else {
                        userId = Long.parseLong(userIdObj.toString());
                    }

                    System.out.println("변환된 userId: " + userId + " (타입: " + userId.getClass().getSimpleName() + ")");
                    System.out.println("사용자 ID " + userId + " 처리 중...");

                    Optional<User> userOpt = userRepository.findById(userId);
                    System.out.println("사용자 조회 결과: " + (userOpt.isPresent() ? "찾음" : "못찾음"));

                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        System.out.println("사용자 찾음: " + user.getEmail() + ", 현재 상태: " + user.getStatus());

                        // 실제 삭제 대신 상태를 SUSPENDED로 변경 (소프트 삭제)
                        try {
                            System.out.println("사용자 상태 변경 전: " + user.getStatus());
                            user.setStatus(User.Status.SUSPENDED);
                            System.out.println("상태 변경 완료: " + user.getStatus());

                            System.out.println("userRepository.save 호출 전...");
                            User savedUser = userRepository.save(user);
                            System.out.println("userRepository.save 호출 완료");
                            System.out.println("사용자 상태 업데이트 완료: " + savedUser.getStatus());
                        } catch (Exception saveException) {
                            System.err.println("사용자 저장 중 오류: " + saveException.getMessage());
                            System.err.println("저장 오류 타입: " + saveException.getClass().getSimpleName());
                            System.err.println("저장 오류 상세:");
                            saveException.printStackTrace();

                            // 더 구체적인 오류 정보 로깅
                            if (saveException.getCause() != null) {
                                System.err.println("원인 예외: " + saveException.getCause().getMessage());
                                System.err.println("원인 예외 타입: " + saveException.getCause().getClass().getSimpleName());
                            }

                            throw saveException;
                        }
                    } else {
                        System.out.println("사용자 ID " + userId + "를 찾을 수 없음");
                    }
                    System.out.println("--- 사용자 ID " + userIdObj + " 처리 완료 ---");
                } catch (NumberFormatException e) {
                    System.err.println("잘못된 사용자 ID 형식: " + userIdObj);
                    e.printStackTrace();
                    throw e;
                } catch (Exception e) {
                    System.err.println("사용자 ID " + userIdObj + " 처리 중 오류: " + e.getMessage());
                    System.err.println("오류 타입: " + e.getClass().getSimpleName());
                    e.printStackTrace();
                    throw e;
                }
            }
            System.out.println("=== UserService.deleteUsers 성공 완료 ===");
            return true;
        } catch (Exception e) {
            System.err.println("deleteUsers 메서드에서 예외 발생: " + e.getMessage());
            System.err.println("예외 타입: " + e.getClass().getSimpleName());
            System.err.println("예외 스택 트레이스:");
            e.printStackTrace();
            return false;
        }
    }

    // 알림 설정 조회
    @Transactional(readOnly = true)
    public UserDTO getNotificationSettings(Long userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
    }

    // 알림 설정 업데이트
    @Transactional
    public UserDTO updateNotificationSettings(Long userId, NotificationSettingsDTO settingsDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        if (settingsDTO.getEmailNotification() != null) {
            user.setEmailNotification(settingsDTO.getEmailNotification());
        }
        if (settingsDTO.getSmsNotification() != null) {
            user.setSmsNotification(settingsDTO.getSmsNotification());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
}