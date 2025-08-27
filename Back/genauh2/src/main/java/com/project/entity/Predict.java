package com.project.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_predict") // 테이블 이름을 정확히 지정
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Predict {

    @Id // 기본키(Primary Key)를 나타냅니다.
    private String predictionId;

    private Long facilityId;

    private Long orgId;

    private String plantId;

    private LocalDateTime ts;

    private Double idlePowerKw;

    private Double predictedMaxKg;

    private Double predictedCurrentKg;

    // 만약 modelVersion과 method 컬럼을 사용한다면 아래 필드를 추가해야 합니다.
    // private String method;
    // private String modelVersion;
}