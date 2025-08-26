package com.project.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private OrganizationDTO user; // UserDTO에서 OrganizationDTO로 변경
    private String message;
    private boolean success;
}