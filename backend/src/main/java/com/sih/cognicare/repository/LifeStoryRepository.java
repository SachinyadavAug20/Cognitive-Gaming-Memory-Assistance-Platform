package com.sih.cognicare.repository;

import com.sih.cognicare.model.LifeStory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LifeStoryRepository extends JpaRepository<LifeStory, Long> {
    Optional<LifeStory> findByPatientId(Long patientId);
}
