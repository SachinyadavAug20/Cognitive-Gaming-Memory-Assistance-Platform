package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientOnboardResponse {
    private Long patientId;
    private MedicalProfileResponse medicalProfile;
    private int familyCount;
    private int placesCount;
}
