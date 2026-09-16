package com.sih.cognicare.service;

import com.sih.cognicare.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface PatientService {
    PatientOnboardResponse onboardPatient(String dataJson, MultipartFile reportFile, List<MultipartFile> photos);
    List<PatientProfileResponse> getAllPatients();
    PatientDetailResponse getPatientDetail(Long patientId);
    List<FamilyMemberResponse> getPatientFamilyMembers(Long patientId);
    List<FamiliarPlaceResponse> getPatientFamiliarPlaces(Long patientId);
    MedicalProfileResponse getPatientMedicalProfile(Long patientId);
    MedicalProfileResponse analyzeDiagnosticReportPdf(MultipartFile reportFile);
}
