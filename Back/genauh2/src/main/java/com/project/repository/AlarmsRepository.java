package com.project.repository;

import com.project.entity.Alarms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlarmsRepository extends JpaRepository<Alarms, Long> {
    List<Alarms> findByFacilityId(Long facilityId);
}