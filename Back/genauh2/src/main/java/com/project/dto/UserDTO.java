package com.project.dto;

import com.project.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long userId;
    private String bizRegNo;
    private String email;
    private User.Role role;
    private String phoneNum;
    private User.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}