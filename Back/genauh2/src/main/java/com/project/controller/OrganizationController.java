package com.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.dto.LoginRequestDTO;
import com.project.dto.NotificationSettingsDTO;
import com.project.dto.OrganizationDTO;
import com.project.dto.RegistrationRequestDTO;
import com.project.entity.Organization;
import com.project.security.TokenProvider;
import com.project.service.OrganizationService;
import com.project.service.PasswordResetService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = { "http://localhost:5174" })
public class OrganizationController {

	@Autowired
	private OrganizationService organizationService;

	@Autowired
	private TokenProvider tokenProvider;

	@Autowired
	private PasswordResetService passwordResetService;

	// 로그인
	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequestDTO loginRequest) {
		String email = loginRequest.getEmail();
		String password = loginRequest.getPassword();

		Map<String, Object> response = new HashMap<>();

		try {
			OrganizationDTO user = organizationService.login(email, password);

			if (user != null) {
				// JWT 토큰 생성 (orgId 사용)
				String token = tokenProvider.create(user.getOrgId().toString());

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
			System.err.println("로그인 오류 발생:");
			System.err.println("오류 타입: " + e.getClass().getSimpleName());
			System.err.println("오류 메시지: " + e.getMessage());
			e.printStackTrace();

			response.put("success", false);
			response.put("message", "로그인 처리 중 오류가 발생했습니다: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// 일반 회원가입 (관리자 권한 불필요, INVITED 상태로 생성)
	@PostMapping("/register")
	public ResponseEntity<Map<String, Object>> register(@RequestBody RegistrationRequestDTO request) {
	    Map<String, Object> response = new HashMap<>();

	    try {
	        // 필수 필드 검증
	        if (request.getOrgName() == null || request.getOwnerName() == null || 
	            request.getEmail() == null || request.getRawPassword() == null) {
	            response.put("success", false);
	            response.put("message", "필수 입력값이 누락되었습니다.");
	            return ResponseEntity.badRequest().body(response);
	        }

	        // facilities 정보 로깅 (디버깅용)
	        System.out.println("받은 facilities 정보: " + request.getFacilities());

	        // INVITED 상태로 회원 생성 (facilities 정보도 함께 전달)
	        OrganizationDTO created = organizationService.createPendingUser(
	            request.getOrgName(), 
	            request.getOwnerName(), 
	            request.getBizRegNo(), 
	            request.getEmail(), 
	            request.getRawPassword(),
	            request.getPhoneNum(),
	            request.getFacilities()  // facilities 정보 추가
	        );

	        response.put("success", true);
	        response.put("data", created);
	        response.put("message", "회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.");
	        return ResponseEntity.ok(response);

	    } catch (RuntimeException e) {
	        response.put("success", false);
	        response.put("message", e.getMessage());
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	    } catch (Exception e) {
	        response.put("success", false);
	        response.put("message", "회원가입 처리 중 오류가 발생했습니다.");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}

	// 관리자용 회원가입 승인 요청 목록 조회
	@GetMapping("/pending")
	public ResponseEntity<Map<String, Object>> getPendingUsers(
			@RequestHeader(value = "Authorization", required = false) String token) {
		Map<String, Object> response = new HashMap<>();

		try {
			// 관리자 권한 확인
			OrganizationDTO currentUser = validateAdminToken(token, response);
			if (currentUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
			}

			List<OrganizationDTO> pendingUsers = organizationService.getInvitedUsers();
			response.put("success", true);
			response.put("data", pendingUsers);
			response.put("message", "승인 대기 중인 회원 목록을 조회했습니다.");
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "승인 대기 목록 조회 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// 관리자용 회원가입 승인/거부
	@PutMapping("/{orgId}/approve")
	public ResponseEntity<Map<String, Object>> approveUser(@PathVariable Long orgId,
			@RequestBody Map<String, String> request,
			@RequestHeader(value = "Authorization", required = false) String token) {

		Map<String, Object> response = new HashMap<>();

		try {
			// 관리자 권한 확인
			OrganizationDTO currentUser = validateAdminToken(token, response);
			if (currentUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
			}

			String action = request.get("action"); // "approve" 또는 "reject"

			if ("approve".equals(action)) {
				// ACTIVE 상태로 변경
				OrganizationDTO updatedUser = organizationService.updateUserStatus(orgId, Organization.Status.ACTIVE);
				if (updatedUser != null) {
					response.put("success", true);
					response.put("data", updatedUser);
					response.put("message", "회원가입이 승인되었습니다.");
					return ResponseEntity.ok(response);
				}
			} else if ("reject".equals(action)) {
				// SUSPENDED 상태로 변경 (거부)
				OrganizationDTO updatedUser = organizationService.updateUserStatus(orgId,
						Organization.Status.SUSPENDED);
				if (updatedUser != null) {
					response.put("success", true);
					response.put("data", updatedUser);
					response.put("message", "회원가입이 거부되었습니다.");
					return ResponseEntity.ok(response);
				}
			}

			response.put("success", false);
			response.put("message", "사용자를 찾을 수 없습니다.");
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "승인 처리 중 오류가 발생했습니다.");
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

			// 사용자 정보로 권한 확인 (orgId 사용)
			OrganizationDTO currentUser = organizationService.getUserById(Long.parseLong(userId));
			if (currentUser == null || !isAdmin(currentUser)) {
				response.put("success", false);
				response.put("message", "관리자 권한이 필요합니다.");
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
			}

			List<OrganizationDTO> users = organizationService.getAllUsers();
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

			OrganizationDTO user = organizationService.getUserById(Long.parseLong(userId));

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
	@PutMapping("/{orgId}/role")
	public ResponseEntity<Map<String, Object>> updateUserRole(@PathVariable Long orgId,
			@RequestBody Map<String, String> request,
			@RequestHeader(value = "Authorization", required = false) String token) {

		Map<String, Object> response = new HashMap<>();

		try {
			// 관리자 권한 확인
			OrganizationDTO currentUser = validateAdminToken(token, response);
			if (currentUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
			}

			String roleStr = request.get("role");

			// String을 Enum으로 변환
			Organization.Role role;
			if ("SUPERVISOR".equalsIgnoreCase(roleStr) || "관리자".equals(roleStr)) {
				role = Organization.Role.SUPERVISOR;
			} else {
				role = Organization.Role.USER;
			}

			OrganizationDTO updatedUser = organizationService.updateUserRole(orgId, role);

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
	@PutMapping("/{orgId}/status")
	public ResponseEntity<Map<String, Object>> updateUserStatus(@PathVariable Long orgId,
			@RequestBody Map<String, String> request,
			@RequestHeader(value = "Authorization", required = false) String token) {

		Map<String, Object> response = new HashMap<>();

		try {
			// 관리자 권한 확인
			OrganizationDTO currentUser = validateAdminToken(token, response);
			if (currentUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
			}

			String statusStr = request.get("status");

			// String을 Enum으로 변환
			Organization.Status status;
			switch (statusStr.toUpperCase()) {
			case "ACTIVE":
			case "활성":
				status = Organization.Status.ACTIVE;
				break;
			case "SUSPENDED":
			case "정지":
				status = Organization.Status.SUSPENDED;
				break;
			case "INVITED":
			case "초대됨":
				status = Organization.Status.INVITED;
				break;
			default:
				status = Organization.Status.ACTIVE;
			}

			OrganizationDTO updatedUser = organizationService.updateUserStatus(orgId, status);

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

	// 관리자용 사용자 비밀번호 변경 (관리자 권한 필요)
	@PutMapping("/{orgId}/password")
	public ResponseEntity<Map<String, Object>> updateUserPassword(@PathVariable Long orgId,
			@RequestBody Map<String, String> request,
			@RequestHeader(value = "Authorization", required = false) String token) {

		Map<String, Object> response = new HashMap<>();

		try {
			// 관리자 권한 확인
			OrganizationDTO currentUser = validateAdminToken(token, response);
			if (currentUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
			}

			String newPassword = request.get("newPassword");

			if (newPassword == null || newPassword.trim().isEmpty()) {
				response.put("success", false);
				response.put("message", "새 비밀번호가 필요합니다.");
				return ResponseEntity.badRequest().body(response);
			}

			boolean updateResult = organizationService.updateUserPassword(orgId, newPassword);

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

	// 현재 비밀번호 확인 API
	@PostMapping("/verify-password")
	public ResponseEntity<Map<String, Object>> verifyPassword(@RequestBody Map<String, String> request,
			@RequestHeader(value = "Authorization", required = false) String token) {

		Map<String, Object> response = new HashMap<>();

		try {
			// 토큰 검증 및 사용자 정보 가져오기
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

			String currentPassword = request.get("currentPassword");

			if (currentPassword == null || currentPassword.trim().isEmpty()) {
				response.put("success", false);
				response.put("message", "현재 비밀번호를 입력해주세요.");
				return ResponseEntity.badRequest().body(response);
			}

			// 비밀번호 확인
			boolean isValidPassword = organizationService.verifyPassword(Long.parseLong(userId), currentPassword);

			if (isValidPassword) {
				response.put("success", true);
				response.put("message", "비밀번호가 확인되었습니다.");
			} else {
				response.put("success", false);
				response.put("message", "현재 비밀번호가 올바르지 않습니다.");
			}

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "비밀번호 확인 중 오류가 발생했습니다: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// 사용자 본인 비밀번호 변경 API
	@PostMapping("/change-password")
	public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> request,
			@RequestHeader(value = "Authorization", required = false) String token) {

		Map<String, Object> response = new HashMap<>();

		try {
			// 토큰 검증 및 사용자 정보 가져오기
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

			String currentPassword = request.get("currentPassword");
			String newPassword = request.get("newPassword");
			String confirmPassword = request.get("confirmPassword");

			// 입력값 검증
			if (currentPassword == null || currentPassword.trim().isEmpty()) {
				response.put("success", false);
				response.put("message", "현재 비밀번호를 입력해주세요.");
				return ResponseEntity.badRequest().body(response);
			}

			if (newPassword == null || newPassword.trim().isEmpty()) {
				response.put("success", false);
				response.put("message", "새 비밀번호를 입력해주세요.");
				return ResponseEntity.badRequest().body(response);
			}

			if (!newPassword.equals(confirmPassword)) {
				response.put("success", false);
				response.put("message", "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
				return ResponseEntity.badRequest().body(response);
			}

			// 새 비밀번호 유효성 검사 (예: 최소 길이 등)
			if (newPassword.length() < 6) {
				response.put("success", false);
				response.put("message", "새 비밀번호는 최소 6자 이상이어야 합니다.");
				return ResponseEntity.badRequest().body(response);
			}

			// 비밀번호 변경
			boolean changeResult = organizationService.changeUserPassword(Long.parseLong(userId), currentPassword,
					newPassword);

			if (changeResult) {
				response.put("success", true);
				response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "현재 비밀번호가 올바르지 않습니다.");
				return ResponseEntity.badRequest().body(response);
			}

		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "비밀번호 변경 중 오류가 발생했습니다: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// 사용자 삭제 (관리자 권한 필요)
	@DeleteMapping("/delete")
	public ResponseEntity<Map<String, Object>> deleteUsers(@RequestBody Map<String, Object> request,
			@RequestHeader(value = "Authorization", required = false) String token) {

		Map<String, Object> response = new HashMap<>();

		System.out.println("=== 사용자 삭제 요청 시작 ===");
		System.out.println("요청 본문: " + request);

		try {
			// 관리자 권한 확인
			OrganizationDTO currentUser = validateAdminToken(token, response);
			if (currentUser == null) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
			}

			@SuppressWarnings("unchecked")
			List<Object> orgIds = (List<Object>) request.get("userIds"); // 기존 API 호환을 위해 userIds 그대로 사용
			System.out.println("삭제할 조직 ID 목록: " + orgIds);

			if (orgIds == null || orgIds.isEmpty()) {
				response.put("success", false);
				response.put("message", "삭제할 사용자 ID 목록이 필요합니다.");
				return ResponseEntity.badRequest().body(response);
			}

			boolean deleteResult = organizationService.deleteUsers(orgIds);

			if (deleteResult) {
				response.put("success", true);
				response.put("message", "선택된 사용자가 삭제되었습니다.");
				return ResponseEntity.ok(response);
			} else {
				response.put("success", false);
				response.put("message", "사용자 삭제 중 오류가 발생했습니다.");
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
			}

		} catch (Exception e) {
			System.err.println("사용자 삭제 컨트롤러에서 예외 발생: " + e.getMessage());
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "사용자 삭제 중 오류가 발생했습니다: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// 현재 사용자의 알림 설정 조회 API
	@GetMapping("/notification-settings")
	public ResponseEntity<Map<String, Object>> getNotificationSettings() {
		Map<String, Object> response = new HashMap<>();
		try {
			Long orgId = getAuthenticatedUserId(); // JWT 토큰에서 사용자 ID 추출
			OrganizationDTO settings = organizationService.getNotificationSettings(orgId);

			response.put("success", true);
			response.put("data", settings);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// 알림 설정 업데이트 API
	@PatchMapping("/notification-settings")
	public ResponseEntity<Map<String, Object>> updateNotificationSettings(
			@RequestBody NotificationSettingsDTO settingsDTO) {
		Map<String, Object> response = new HashMap<>();
		try {
			Long orgId = getAuthenticatedUserId(); // JWT 토큰에서 사용자 ID 추출
			OrganizationDTO updatedUser = organizationService.updateNotificationSettings(orgId, settingsDTO);

			response.put("success", true);
			response.put("message", "알림 설정이 업데이트되었습니다.");
			response.put("data", updatedUser);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// 1. JWT 토큰 기반 비밀번호 리셋 요청 (로그인된 사용자용)
	@PostMapping("/request-password-reset")
	public ResponseEntity<Map<String, Object>> requestPasswordReset(
	        @RequestHeader(value = "Authorization", required = false) String token) {
	    Map<String, Object> response = new HashMap<>();
	    
	    try {
	        // JWT 토큰에서 사용자 ID 추출
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

	        // 사용자 정보 조회
	        OrganizationDTO user = organizationService.getUserById(Long.parseLong(userId));
	        if (user == null) {
	            response.put("success", false);
	            response.put("message", "사용자 정보를 찾을 수 없습니다.");
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	        }

	        // 활성 사용자만 비밀번호 리셋 가능
	        if (user.getStatus() != Organization.Status.ACTIVE) {
	            response.put("success", false);
	            response.put("message", "활성 상태의 계정만 비밀번호 재설정이 가능합니다.");
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
	        }

	        // 등록된 이메일로 리셋 링크 발송
	        boolean result = passwordResetService.requestPasswordReset(user.getEmail());
	        
	        if (result) {
	            response.put("success", true);
	            response.put("message", "비밀번호 재설정 링크가 등록된 이메일로 전송되었습니다.");
	            return ResponseEntity.ok(response);
	        } else {
	            response.put("success", false);
	            response.put("message", "비밀번호 재설정 요청 처리 중 오류가 발생했습니다.");
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	        }
	        
	    } catch (Exception e) {
	        System.err.println("비밀번호 리셋 요청 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        response.put("success", false);
	        response.put("message", "비밀번호 재설정 요청 처리 중 오류가 발생했습니다.");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}

	// 2. 비밀번호 리셋 토큰 검증 (공개 API - JWT 토큰 불필요)
	@GetMapping("/validate-reset-token/{token}")
	public ResponseEntity<Map<String, Object>> validateResetToken(@PathVariable String token) {
	    Map<String, Object> response = new HashMap<>();
	    
	    try {
	        boolean isValid = passwordResetService.validateResetToken(token);
	        
	        if (isValid) {
	            response.put("success", true);
	            response.put("message", "유효한 토큰입니다.");
	        } else {
	            response.put("success", false);
	            response.put("message", "유효하지 않거나 만료된 토큰입니다.");
	        }
	        
	        return ResponseEntity.ok(response);
	        
	    } catch (Exception e) {
	        System.err.println("토큰 검증 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        response.put("success", false);
	        response.put("message", "토큰 검증 중 오류가 발생했습니다.");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}

	// 3. 비밀번호 리셋 실행 (공개 API - JWT 토큰 불필요)
	@PostMapping("/reset-password")
	public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
	    Map<String, Object> response = new HashMap<>();
	    
	    try {
	        String token = request.get("token");
	        String newPassword = request.get("newPassword");
	        String confirmPassword = request.get("confirmPassword");
	        
	        // 입력값 검증
	        if (token == null || token.trim().isEmpty()) {
	            response.put("success", false);
	            response.put("message", "유효하지 않은 토큰입니다.");
	            return ResponseEntity.badRequest().body(response);
	        }
	        
	        if (newPassword == null || newPassword.trim().isEmpty()) {
	            response.put("success", false);
	            response.put("message", "새 비밀번호를 입력해주세요.");
	            return ResponseEntity.badRequest().body(response);
	        }
	        
	        if (!newPassword.equals(confirmPassword)) {
	            response.put("success", false);
	            response.put("message", "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
	            return ResponseEntity.badRequest().body(response);
	        }
	        
	        // 비밀번호 유효성 검사
	        if (newPassword.length() < 6) {
	            response.put("success", false);
	            response.put("message", "새 비밀번호는 최소 6자 이상이어야 합니다.");
	            return ResponseEntity.badRequest().body(response);
	        }
	        
	        boolean result = passwordResetService.resetPassword(token, newPassword);
	        
	        if (result) {
	            response.put("success", true);
	            response.put("message", "비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.");
	            return ResponseEntity.ok(response);
	        } else {
	            response.put("success", false);
	            response.put("message", "유효하지 않거나 만료된 토큰입니다.");
	            return ResponseEntity.badRequest().body(response);
	        }
	        
	    } catch (Exception e) {
	        System.err.println("비밀번호 리셋 실행 오류: " + e.getMessage());
	        e.printStackTrace();
	        
	        response.put("success", false);
	        response.put("message", "비밀번호 변경 중 오류가 발생했습니다.");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}

	// 4. 만료된 토큰 정리 (관리자용)
	@PostMapping("/admin/cleanup-expired-tokens")
	public ResponseEntity<Map<String, Object>> cleanupExpiredTokens(
	        @RequestHeader(value = "Authorization", required = false) String token) {
	    Map<String, Object> response = new HashMap<>();
	    
	    try {
	        // 관리자 권한 확인
	        OrganizationDTO currentUser = validateAdminToken(token, response);
	        if (currentUser == null) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
	        }
	        
	        passwordResetService.cleanupExpiredTokens();
	        
	        response.put("success", true);
	        response.put("message", "만료된 토큰이 정리되었습니다.");
	        return ResponseEntity.ok(response);
	        
	    } catch (Exception e) {
	        response.put("success", false);
	        response.put("message", "토큰 정리 중 오류가 발생했습니다.");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}
	
	// 관리자 토큰 검증 헬퍼 메서드
	private OrganizationDTO validateAdminToken(String token, Map<String, Object> response) {
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

			OrganizationDTO currentUser = organizationService.getUserById(Long.parseLong(userId));
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

	// 관리자 권한 확인 헬퍼 메서드
	private boolean isAdmin(OrganizationDTO user) {
		return user.getRole() != null && (user.getRole().equals(Organization.Role.SUPERVISOR)
				|| "SUPERVISOR".equals(user.getRole().toString()));
	}

	// JWT 토큰에서 사용자(조직) ID를 추출하는 헬퍼 메소드
	private Long getAuthenticatedUserId() {
		// SecurityContext에서 인증 정보 가져오기
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		// 인증 정보가 없거나, 인증되지 않았거나, 익명 사용자인 경우 예외 발생
		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {
			throw new SecurityException("인증된 사용자가 아닙니다.");
		}

		// Principal에서 사용자 ID(문자열)를 가져와 Long으로 변환
		String userIdStr = (String) authentication.getPrincipal();
		return Long.parseLong(userIdStr);
	}
}