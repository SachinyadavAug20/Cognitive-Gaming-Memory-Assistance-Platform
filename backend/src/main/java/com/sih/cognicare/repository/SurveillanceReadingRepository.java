package com.sih.cognicare.repository;

import com.sih.cognicare.model.SurveillanceReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SurveillanceReadingRepository extends JpaRepository<SurveillanceReading, Long> {
    List<SurveillanceReading> findTop50ByPatientIdOrderByRecordedAtDesc(Long patientId);
    List<SurveillanceReading> findByPatientIdAndRecordedAtAfterOrderByRecordedAtAsc(Long patientId, LocalDateTime since);
    Optional<SurveillanceReading> findTopByPatientIdOrderByRecordedAtDesc(Long patientId);
}
