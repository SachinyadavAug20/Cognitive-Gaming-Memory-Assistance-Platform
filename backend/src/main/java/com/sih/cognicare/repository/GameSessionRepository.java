package com.sih.cognicare.repository;

import com.sih.cognicare.model.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    List<GameSession> findByPatientIdOrderByTimestampDesc(Long patientId);
    List<GameSession> findTop10ByPatientIdOrderByTimestampDesc(Long patientId);
    List<GameSession> findTop50ByOrderByTimestampDesc();
}
