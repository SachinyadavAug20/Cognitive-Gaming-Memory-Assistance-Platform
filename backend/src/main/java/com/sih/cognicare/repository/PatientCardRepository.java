package com.sih.cognicare.repository;

import com.sih.cognicare.model.PatientCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientCardRepository extends JpaRepository<PatientCard, UUID> {

    Optional<PatientCard> findTopBySecureTokenAndIsActiveTrue(String secureToken);

    List<PatientCard> findAllByPatientId(Long patientId);

    @Modifying
    @Query("update PatientCard c set c.isActive = false where c.patientId = :patientId and c.isActive = true")
    int deactivateActiveCardsByPatientId(@Param("patientId") Long patientId);
}