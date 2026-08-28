package com.sih.cognicare.repository;

import com.sih.cognicare.model.FamiliarPlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FamiliarPlaceRepository extends JpaRepository<FamiliarPlace, Long> {
    List<FamiliarPlace> findByPatientId(Long patientId);
}
