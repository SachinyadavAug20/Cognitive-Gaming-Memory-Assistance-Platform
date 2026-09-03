package com.sih.cognicare.repository;

import com.sih.cognicare.model.CaregiverSosRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaregiverSosRepository extends JpaRepository<CaregiverSosRequest, Long> {
    List<CaregiverSosRequest> findTop20ByOrderByRequestedAtDesc();
    List<CaregiverSosRequest> findByStatusOrderByRequestedAtDesc(String status);
    List<CaregiverSosRequest> findTop5ByPatientIdOrderByRequestedAtDesc(Long patientId);
}
