package com.sih.cognicare.controller;

import com.sih.cognicare.dto.KioskScanRequest;
import com.sih.cognicare.dto.KioskScanResponse;
import com.sih.cognicare.service.PatientCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/kiosk")
@RequiredArgsConstructor
public class KioskAuthController {

    private final PatientCardService patientCardService;

    @PostMapping("/scan")
    public ResponseEntity<KioskScanResponse> scan(@Valid @RequestBody KioskScanRequest request) {
        return ResponseEntity.ok(patientCardService.scan(request.qrData()));
    }

    @PostMapping("/demo")
    public ResponseEntity<KioskScanResponse> demo() {
        return ResponseEntity.ok(patientCardService.demoLogin());
    }
}