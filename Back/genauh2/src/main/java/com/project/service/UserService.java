package com.project.service;

import com.project.dto.UserDTO;
import com.project.entity.User;
import com.project.repository.UserRepository;
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

    // 모든 활성 사용자 조회
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findByStatus(User.Status.ACTIVE);
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 사용자 ID로 조회
    public UserDTO getUserById(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(this::convertToDTO).orElse(null);
    }

    // 이메일로 사용자 조회
    public UserDTO getUserByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmailAndStatus(email, User.Status.ACTIVE);
        return userOpt.map(this::convertToDTO).orElse(null);
    }

    // 사용자 생성
    public UserDTO createUser(String email, String password, User.Role role, String bizRegNo) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setBizRegNo(bizRegNo);
        user.setStatus(User.Status.ACTIVE);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    // 사용자 역할 업데이트
    public UserDTO updateUserRole(Long userId, User.Role role) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(role);
            User updatedUser = userRepository.save(user);
            return convertToDTO(updatedUser);
        }

        return null;
    }

    // 사용자 상태 변경
    public UserDTO updateUserStatus(Long userId, User.Status status) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(status);
            User updatedUser = userRepository.save(user);
            return convertToDTO(updatedUser);
        }

        return null;
    }

    // 사용자 정지
    public boolean suspendUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus(User.Status.SUSPENDED);
            userRepository.save(user);
            return true;
        }

        return false;
    }

    // 사업자등록번호별 사용자 조회
    public List<UserDTO> getUsersByBizRegNo(String bizRegNo) {
        List<User> users = userRepository.findByBizRegNoAndStatus(bizRegNo, User.Status.ACTIVE);
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 사용자 삭제 (여러 사용자)
    public boolean deleteUsers(List<?> userIds) {
        try {
            System.out.println("deleteUsers 메서드 시작 - 입력된 userIds: " + userIds);

            for (Object userIdObj : userIds) {
                try {
                    System.out.println(
                            "처리 중인 userIdObj: " + userIdObj + " (타입: " + userIdObj.getClass().getSimpleName() + ")");

                    Long userId;
                    if (userIdObj instanceof Integer) {
                        userId = ((Integer) userIdObj).longValue();
                    } else if (userIdObj instanceof String) {
                        userId = Long.parseLong((String) userIdObj);
                    } else {
                        System.err.println("지원하지 않는 타입: " + userIdObj.getClass().getSimpleName());
                        return false;
                    }

                    System.out.println("파싱된 userId: " + userId);

                    Optional<User> userOpt = userRepository.findById(userId);
                    System.out.println("데이터베이스 조회 결과: " + (userOpt.isPresent() ? "사용자 발견" : "사용자 없음"));

                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        System.out.println("기존 사용자 상태: " + user.getStatus());

                        // 실제 삭제 대신 상태를 SUSPENDED로 변경 (소프트 삭제)
                        user.setStatus(User.Status.SUSPENDED);
                        System.out.println("상태를 SUSPENDED로 변경 완료");

                        // 저장 시도
                        try {
                            User savedUser = userRepository.save(user);
                            System.out.println(
                                    "사용자 ID " + userId + " 상태를 SUSPENDED로 변경하고 저장 완료: " + savedUser.getStatus());
                        } catch (Exception saveException) {
                            System.err.println("사용자 저장 중 오류 발생: " + saveException.getMessage());
                            saveException.printStackTrace();
                            return false;
                        }
                    } else {
                        System.out.println("사용자 ID " + userId + "를 찾을 수 없습니다.");
                    }
                } catch (NumberFormatException e) {
                    System.err.println("잘못된 사용자 ID 형식: " + userIdObj);
                    return false;
                } catch (Exception e) {
                    System.err.println("사용자 ID " + userIdObj + " 처리 중 오류: " + e.getMessage());
                    e.printStackTrace();
                    return false;
                }
            }

            System.out.println("deleteUsers 메서드 완료 - 모든 사용자 처리 성공");
            return true;
        } catch (Exception e) {
            System.err.println("deleteUsers 메서드 전체 오류: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Entity를 DTO로 변환
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getUserId(),
                user.getBizRegNo(),  // user.getOrgId()에서 변경
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    public List<UserDTO> searchUsers(String keyword) {
        // TODO Auto-generated method stub
        return null;
    }
}