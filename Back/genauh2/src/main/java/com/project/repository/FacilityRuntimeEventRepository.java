package com.project.repository;

import com.project.entity.FacilityRuntimeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacilityRuntimeEventRepository extends JpaRepository<FacilityRuntimeEvent, Long> {
}