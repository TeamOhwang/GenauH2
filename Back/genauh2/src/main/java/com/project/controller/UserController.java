package com.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.dto.LoginRequestDTO;
import com.project.dto.UserDTO;
import com.project.security.TokenProvider;
import com.project.service.UserService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = { "http://localhost:5174" })
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private TokenProvider tokenProvider; // TokenProvider 주입

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequestDTO loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Map<String, Object> response = new HashMap<>();

        try {
            UserDTO user = userService.login(email, password);

            if (user != null) {
                // JWT 토큰 생성 (TokenProvider 사용)
                String token = tokenProvider.create(user.getUserId().toString());

                response.put("success", true);
                response.put("token", token);
                response.put("user", user);
                response.put("message", "로그인 성공");
                return ResponseEntity.ok(response);

            } else {
                response.put("success", false);
                response.put("message", "이메일 또는 비밀번호가 올바르지 않습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            System.err.println("❌ 로그인 오류 발생:");
            System.err.println("오류 타입: " + e.getClass().getSimpleName());
            System.err.println("오류 메시지: " + e.getMessage());
            e.printStackTrace();

            response.put("success", false);
            response.put("message", "로그인 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 조직 + 사용자 등록 (관리자 권한 필요)
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerOrganizationAndUser(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 관리자 권한 검증
            UserDTO currentUser = validateAdminToken(token, response);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            String orgName = request.get("orgName");
            String name = request.get("name");
            String bizRegNo = request.get("bizRegNo");
            String email = request.get("email");
            String password = request.get("password");

            if (orgName == null || name == null || bizRegNo == null || email == null || password == null) {
                response.put("success", false);
                response.put("message", "필수 입력값이 누락되었습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            UserDTO created = userService.createOrganizationAndUser(orgName, name, bizRegNo, email, password);

            response.put("success", true);
            response.put("data", created);
            response.put("message", "조직 및 사용자가 등록되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "로그아웃 되었습니다.");
        return ResponseEntity.ok(response);
    }

    // 사용자 목록 조회 (관리자 권한 필요)
    @GetMapping("/list")
    public ResponseEntity<?> getUserList(@RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 토큰 검증 및 권한 확인
            if (token == null || !token.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "인증 토큰이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String actualToken = token.substring(7);
            String userId = tokenProvider.validateAndGetUserId(actualToken);

            if (userId == null) {
                response.put("success", false);
                response.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // 사용자 정보로 권한 확인
            UserDTO currentUser = userService.getUserById(Long.parseLong(userId));
            if (currentUser == null || !isAdmin(currentUser)) {
                response.put("success", false);
                response.put("message", "관리자 권한이 필요합니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 목록을 가져오는 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 사용자 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(
            @RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "인증 토큰이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String actualToken = token.substring(7);
            String userId = tokenProvider.validateAndGetUserId(actualToken);

            if (userId == null) {
                response.put("success", false);
                response.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            UserDTO user = userService.getUserById(Long.parseLong(userId));

            if (user != null) {
                response.put("success", true);
                response.put("data", user);
                return ResponseEntity.ok(response);
            }

            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 정보를 가져올 수 없습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 사용자 역할 업데이트 (관리자 권한 필요)
    @PutMapping("/{userId}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            UserDTO currentUser = validateAdminToken(token, response);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            String roleStr = request.get("role");

            // String을 Enum으로 변환
            com.project.entity.User.Role role;
            if ("SUPERVISOR".equalsIgnoreCase(roleStr) || "관리자".equals(roleStr)) {
                role = com.project.entity.User.Role.SUPERVISOR;
            } else {
                role = com.project.entity.User.Role.USER;
            }

            UserDTO updatedUser = userService.updateUserRole(userId, role);

            if (updatedUser != null) {
                response.put("success", true);
                response.put("data", updatedUser);
                response.put("message", "사용자 역할이 업데이트되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "역할 업데이트 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 사용자 상태 업데이트
    @PutMapping("/{userId}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            UserDTO currentUser = validateAdminToken(token, response);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            String statusStr = request.get("status");

            // String을 Enum으로 변환
            com.project.entity.User.Status status;
            switch (statusStr.toUpperCase()) {
                case "ACTIVE":
                case "활성":
                    status = com.project.entity.User.Status.ACTIVE;
                    break;
                case "SUSPENDED":
                case "정지":
                    status = com.project.entity.User.Status.SUSPENDED;
                    break;
                case "INVITED":
                case "초대됨":
                    status = com.project.entity.User.Status.INVITED;
                    break;
                default:
                    status = com.project.entity.User.Status.ACTIVE;
            }

            UserDTO updatedUser = userService.updateUserStatus(userId, status);

            if (updatedUser != null) {
                response.put("success", true);
                response.put("data", updatedUser);
                response.put("message", "사용자 상태가 업데이트되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "상태 업데이트 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 사용자 비밀번호 변경 (관리자 권한 필요)
    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, Object>> updateUserPassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 관리자 권한 확인
            UserDTO currentUser = validateAdminToken(token, response);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            String newPassword = request.get("newPassword");

            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "새 비밀번호가 필요합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            boolean updateResult = userService.updateUserPassword(userId, newPassword);

            if (updateResult) {
                response.put("success", true);
                response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "비밀번호 변경 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 사용자 삭제 (관리자 권한 필요)
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteUsers(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Map<String, Object> response = new HashMap<>();

        System.out.println("=== 사용자 삭제 요청 시작 ===");
        System.out.println("요청 본문: " + request);
        System.out.println("요청 본문 타입: " + (request != null ? request.getClass().getSimpleName() : "null"));
        System.out.println("토큰: " + (token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "null"));

        try {
            // 관리자 권한 확인
            System.out.println("관리자 권한 확인 중...");
            UserDTO currentUser = validateAdminToken(token, response);
            if (currentUser == null) {
                System.out.println("관리자 권한 확인 실패");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            System.out.println("관리자 권한 확인 완료: " + currentUser.getEmail());

            @SuppressWarnings("unchecked")
            List<Object> userIds = (List<Object>) request.get("userIds");
            System.out.println("삭제할 사용자 ID 목록: " + userIds);
            System.out.println("userIds 타입: " + (userIds != null ? userIds.getClass().getSimpleName() : "null"));

            if (userIds == null || userIds.isEmpty()) {
                System.out.println("사용자 ID 목록이 비어있음");
                response.put("success", false);
                response.put("message", "삭제할 사용자 ID 목록이 필요합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 사용자 삭제 처리
            System.out.println("UserService.deleteUsers 호출 중...");
            boolean deleteResult = userService.deleteUsers(userIds);
            System.out.println("UserService.deleteUsers 결과: " + deleteResult);

            if (deleteResult) {
                response.put("success", true);
                response.put("message", "선택된 사용자가 삭제되었습니다.");
                System.out.println("사용자 삭제 성공");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "사용자 삭제 중 오류가 발생했습니다.");
                System.out.println("사용자 삭제 실패");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

        } catch (Exception e) {
            System.err.println("사용자 삭제 컨트롤러에서 예외 발생: " + e.getMessage());
            System.err.println("예외 타입: " + e.getClass().getSimpleName());
            System.err.println("예외 스택 트레이스:");
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "사용자 삭제 중 오류가 발생했습니다: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 관리자 토큰 검증 헬퍼 메소드 (수정됨)
    private UserDTO validateAdminToken(String token, Map<String, Object> response) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "인증 토큰이 필요합니다.");
                return null;
            }

            String actualToken = token.substring(7);
            String userId = tokenProvider.validateAndGetUserId(actualToken);

            if (userId == null) {
                response.put("success", false);
                response.put("message", "유효하지 않은 토큰입니다.");
                return null;
            }

            UserDTO currentUser = userService.getUserById(Long.parseLong(userId));
            if (currentUser == null || !isAdmin(currentUser)) {
                response.put("success", false);
                response.put("message", "관리자 권한이 필요합니다.");
                return null;
            }

            return currentUser;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "토큰 검증 중 오류가 발생했습니다.");
            return null;
        }
    }

    // 관리자 권한 확인 헬퍼 메소드
    private boolean isAdmin(UserDTO user) {
        return user.getRole() != null &&
                (user.getRole().equals(com.project.entity.User.Role.SUPERVISOR) ||
                        "SUPERVISOR".equals(user.getRole().toString()));
    }
}