package com.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.entity.Facility;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    
    List<Facility> findByOrgId(Long orgId);
}