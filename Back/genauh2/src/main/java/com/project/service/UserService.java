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
    public UserDTO createUser(String email, String password, User.Role role, Long orgId) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setOrgId(orgId);
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
    
    // 조직별 사용자 조회
    public List<UserDTO> getUsersByOrg(Long orgId) {
        List<User> users = userRepository.findByOrgIdAndStatus(orgId, User.Status.ACTIVE);
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getUserId(),
            user.getOrgId(),
            user.getEmail(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

	public List<UserDTO> searchUsers(String keyword) {
		// TODO Auto-generated method stub
		return null;
	}
}
