package com.project.repository;

import com.project.entity.User;
import com.project.dto.UserOrganizationDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserOrganizationRepository extends JpaRepository<User, Long> {

    @Query("SELECT new com.project.dto.UserOrganizationDTO(" +
           "u.userId, u.email, u.role, u.status, u.bizRegNo, " +
           "o.orgName, o.name, u.createdAt, u.updatedAt, o.createdAt, o.updatedAt) " +
           "FROM User u " +
           "LEFT JOIN Organization o ON u.bizRegNo = o.bizRegNo " +
           "WHERE u.userId = :userId")
    Optional<UserOrganizationDTO> findUserWithOrganization(@Param("userId") Long userId);

    @Query("SELECT new com.project.dto.UserOrganizationDTO(" +
           "u.userId, u.email, u.role, u.status, u.bizRegNo, " +
           "o.orgName, o.name, u.createdAt, u.updatedAt, o.createdAt, o.updatedAt) " +
           "FROM User u " +
           "LEFT JOIN Organization o ON u.bizRegNo = o.bizRegNo " +
           "WHERE u.bizRegNo = :bizRegNo")
    List<UserOrganizationDTO> findUsersByBizRegNo(@Param("bizRegNo") String bizRegNo);

    @Query("SELECT new com.project.dto.UserOrganizationDTO(" +
           "u.userId, u.email, u.role, u.status, u.bizRegNo, " +
           "o.orgName, o.name, u.createdAt, u.updatedAt, o.createdAt, o.updatedAt) " +
           "FROM User u " +
           "LEFT JOIN Organization o ON u.bizRegNo = o.bizRegNo")
    List<UserOrganizationDTO> findAllUsersWithOrganizations();
}
