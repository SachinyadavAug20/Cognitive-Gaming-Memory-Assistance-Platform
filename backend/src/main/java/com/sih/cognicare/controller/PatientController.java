package com.sih.cognicare.controller;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/patients/onboard")
    public ResponseEntity<PatientOnboardResponse> onboardPatient(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "reportFile", required = false) MultipartFile reportFile,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        return ResponseEntity.ok(patientService.onboardPatient(dataJson, reportFile, photos));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientProfileResponse>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientDetailResponse> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientDetail(id));
    }

    @GetMapping("/patients/{id}/family")
    public ResponseEntity<List<FamilyMemberResponse>> getFamilyMembers(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientFamilyMembers(id));
    }

    @GetMapping("/patients/{id}/places")
    public ResponseEntity<List<FamiliarPlaceResponse>> getFamiliarPlaces(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientFamiliarPlaces(id));
    }

    @GetMapping("/patients/{id}/medical-profile")
    public ResponseEntity<MedicalProfileResponse> getMedicalProfile(@PathVariable Long id) {
        MedicalProfileResponse profile = patientService.getPatientMedicalProfile(id);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PostMapping(value = "/patients/analyze-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicalProfileResponse> analyzePdfOnly(
            @RequestPart("reportFile") MultipartFile reportFile) {
        return ResponseEntity.ok(patientService.analyzeDiagnosticReportPdf(reportFile));
    }
}
