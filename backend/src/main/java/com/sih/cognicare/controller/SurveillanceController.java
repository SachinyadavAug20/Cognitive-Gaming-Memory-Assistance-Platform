package com.sih.cognicare.controller;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.CaregiverSosRequest;
import com.sih.cognicare.service.SurveillanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class SurveillanceController {

    private final SurveillanceService surveillanceService;

    public SurveillanceController(SurveillanceService surveillanceService) {
        this.surveillanceService = surveillanceService;
    }

    // ── Ingest: from app / simulator / device ──

    @PostMapping({"/surveillance/patients/{id}/readings", "/api/v1/surveillance/patients/{id}/readings"})
    public ResponseEntity<SurveillanceReadingDTO> recordReading(
            @PathVariable("id") Long patientId,
            @RequestBody SurveillanceReadingRequest request) {
        return ResponseEntity.ok(surveillanceService.recordReading(patientId, request));
    }

    @PostMapping({"/surveillance/patients/{id}/alerts", "/api/v1/surveillance/patients/{id}/alerts"})
    public ResponseEntity<SurveillanceAlertDTO> raiseAlert(
            @PathVariable("id") Long patientId,
            @RequestBody SurveillanceAlertDTO dto) {
        return ResponseEntity.ok(surveillanceService.raiseAlert(patientId, dto));
    }

    @PostMapping({"/surveillance/patients/{id}/sos", "/api/v1/surveillance/patients/{id}/sos"})
    public ResponseEntity<CaregiverSosDTO> processSos(
            @PathVariable("id") Long patientId,
            @RequestBody CaregiverSosDTO dto) {
        CaregiverSosRequest sos = surveillanceService.processSos(patientId, dto);
        return ResponseEntity.ok(toDto(sos));
    }

    @GetMapping({"/surveillance/patients/{id}/sos/latest", "/api/v1/surveillance/patients/{id}/sos/latest"})
    public ResponseEntity<?> latestSosForPatient(@PathVariable("id") Long patientId) {
        CaregiverSosDTO sos = surveillanceService.getLatestSosForPatient(patientId);
        return sos != null ? ResponseEntity.ok(sos) : ResponseEntity.noContent().build();
    }

    // ── Admin reads ──

    @GetMapping({"/admin/surveillance/patients", "/api/v1/admin/surveillance/patients"})
    public ResponseEntity<List<PatientSurveillanceDTO>> patientSurveillance() {
        return ResponseEntity.ok(surveillanceService.getAllSurveillanceSummary());
    }

    @GetMapping({"/admin/surveillance/patients/{id}", "/api/v1/admin/surveillance/patients/{id}"})
    public ResponseEntity<PatientSurveillanceDTO> patientSurveillanceSingle(@PathVariable("id") Long patientId) {
        return ResponseEntity.ok(surveillanceService.getPatientSurveillance(patientId));
    }

    @GetMapping({"/admin/surveillance/alerts", "/api/v1/admin/surveillance/alerts"})
    public ResponseEntity<List<SurveillanceAlertDTO>> alerts(
            @RequestParam(value = "unresolvedOnly", defaultValue = "true") boolean unresolvedOnly) {
        return ResponseEntity.ok(surveillanceService.getAlerts(unresolvedOnly));
    }

    @PostMapping({"/admin/surveillance/alerts/{id}/resolve", "/api/v1/admin/surveillance/alerts/{id}/resolve"})
    public ResponseEntity<SurveillanceAlertDTO> resolveAlert(
            @PathVariable("id") Long alertId,
            @RequestBody(required = false) Map<String, String> body) {
        String by = body != null ? body.get("actor") : null;
        return ResponseEntity.ok(surveillanceService.resolveAlert(alertId, by));
    }

    @GetMapping({"/admin/surveillance/sos", "/api/v1/admin/surveillance/sos"})
    public ResponseEntity<List<CaregiverSosDTO>> sosRequests(
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(surveillanceService.getSosRequests(status));
    }

    @PostMapping({"/admin/surveillance/sos/{id}/acknowledge", "/api/v1/admin/surveillance/sos/{id}/acknowledge"})
    public ResponseEntity<CaregiverSosDTO> acknowledgeSos(
            @PathVariable("id") Long sosId,
            @RequestBody(required = false) Map<String, String> body) {
        String by = body != null ? body.get("acknowledgedBy") : null;
        return ResponseEntity.ok(toDto(surveillanceService.acknowledgeSos(sosId, by)));
    }

    @GetMapping({"/admin/surveillance/patients/{id}/history", "/api/v1/admin/surveillance/patients/{id}/history"})
    public ResponseEntity<List<SurveillanceReadingDTO>> history(
            @PathVariable("id") Long patientId,
            @RequestParam(value = "hours", defaultValue = "24") int hours) {
        return ResponseEntity.ok(surveillanceService.getHistory(patientId, hours));
    }

    // ── Demo seeder ──

    @PostMapping({"/admin/surveillance/simulate", "/api/v1/admin/surveillance/simulate"})
    public ResponseEntity<Map<String, Object>> simulate() {
        return ResponseEntity.ok(surveillanceService.simulate());
    }

    private CaregiverSosDTO toDto(CaregiverSosRequest s) {
        return CaregiverSosDTO.builder()
                .id(s.getId())
                .patientId(s.getPatient().getId())
                .patientName(s.getPatient().getName())
                .patientLat(s.getPatientLat())
                .patientLng(s.getPatientLng())
                .locationLabel(s.getLocationLabel())
                .status(s.getStatus())
                .acknowledgedBy(s.getAcknowledgedBy())
                .requestedAt(s.getRequestedAt())
                .acknowledgedAt(s.getAcknowledgedAt())
                .build();
    }
}
