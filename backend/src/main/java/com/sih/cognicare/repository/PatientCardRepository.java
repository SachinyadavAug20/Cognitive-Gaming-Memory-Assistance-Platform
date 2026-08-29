package com.sih.cognicare.repository;

import com.sih.cognicare.model.PatientCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientCardRepository extends JpaRepository<PatientCard, UUID> {

    Optional<PatientCard> findTopBySecureTokenAndIsActiveTrue(String secureToken);

    List<PatientCard> findAllByPatientId(Long patientId);

    List<PatientCard> findAllByPatientIdAndIsActiveTrue(Long patientId);

    Optional<PatientCard> findTopByPatientIdAndIsActiveTrue(Long patientId);
}