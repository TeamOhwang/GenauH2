package com.project.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "facility_runtime_events")
@Data
public class FacilityRuntimeEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long runtimeEventId;

    @Column(nullable = false)
    private Long facilityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private State state;

    private String reasonCode;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private String comments;

    public enum State {
        RUN, IDLE, STOP, MAINTENANCE
    }
}