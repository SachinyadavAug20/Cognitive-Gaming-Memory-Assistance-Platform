package com.sih.cognicare.repository;

import com.sih.cognicare.model.MedicalProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicalProfileRepository extends JpaRepository<MedicalProfile, Long> {
    Optional<MedicalProfile> findByPatientId(Long patientId);
}
