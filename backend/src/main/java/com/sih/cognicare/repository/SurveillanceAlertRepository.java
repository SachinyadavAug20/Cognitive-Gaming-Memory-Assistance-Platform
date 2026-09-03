package com.sih.cognicare.repository;

import com.sih.cognicare.model.SurveillanceAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SurveillanceAlertRepository extends JpaRepository<SurveillanceAlert, Long> {
    List<SurveillanceAlert> findTop50ByOrderByTriggeredAtDesc();
    List<SurveillanceAlert> findByResolvedFalseOrderByTriggeredAtDesc();
    List<SurveillanceAlert> findTop20ByPatientIdOrderByTriggeredAtDesc(Long patientId);
    long countByResolvedFalse();
}
