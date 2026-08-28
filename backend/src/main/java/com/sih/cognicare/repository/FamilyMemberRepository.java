package com.sih.cognicare.repository;

import com.sih.cognicare.model.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByPatientId(Long patientId);
}
