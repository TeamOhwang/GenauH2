package com.project.dto;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequestDTO {
    // 조직(사용자) 정보
    private String orgName;
    private String ownerName;
    private String bizRegNo;
    private String email;
    private String rawPassword;
    private String phoneNum;
    
    // 시설 정보 (배열)
    private List<FacilityRequestDTO> facilities;
}