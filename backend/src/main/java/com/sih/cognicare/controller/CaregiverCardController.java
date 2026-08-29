package com.sih.cognicare.controller;

import com.sih.cognicare.dto.GenerateCardResponse;
import com.sih.cognicare.service.PatientCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/caregiver/patients")
@RequiredArgsConstructor
public class CaregiverCardController {

    private final PatientCardService patientCardService;

    @PostMapping("/{patientId}/card")
    public ResponseEntity<GenerateCardResponse> generateCard(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientCardService.generateCard(patientId));
    }
}