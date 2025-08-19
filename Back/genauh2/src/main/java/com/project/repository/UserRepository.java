package com.project.repository;

import com.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 이메일로 사용자 찾기
    Optional<User> findByEmail(String email);
    
    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);
    
    // 활성 사용자만 조회 (ACTIVE 상태)
    List<User> findByStatus(User.Status status);
    
    // 역할별 사용자 조회
    List<User> findByRole(User.Role role);
    
    // 사업자등록번호별 사용자 조회
    List<User> findByBizRegNo(String bizRegNo);
    
    // 이메일과 활성 상태로 사용자 찾기
    Optional<User> findByEmailAndStatus(String email, User.Status status);
    
    // 사업자등록번호별 사용자 조회
    List<User> findByBizRegNoAndStatus(String bizRegNo, User.Status status);
    
    // 역할과 상태로 사용자 조회
    List<User> findByRoleAndStatus(User.Role role, User.Status status);
}
