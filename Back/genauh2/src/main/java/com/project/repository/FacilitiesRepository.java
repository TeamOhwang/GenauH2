package com.project.repository;

import com.project.entity.Facilities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacilitiesRepository extends JpaRepository<Facilities, String> {

	Optional<Facilities> findByFacilityId(String facilityId);
}
