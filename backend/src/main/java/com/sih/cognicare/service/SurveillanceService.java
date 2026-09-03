package com.sih.cognicare.service;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.exception.PatientNotFoundException;
import com.sih.cognicare.model.*;
import com.sih.cognicare.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SurveillanceService {

    private static final Logger log = LoggerFactory.getLogger(SurveillanceService.class);

    private final SurveillanceReadingRepository readingRepository;
    private final SurveillanceAlertRepository alertRepository;
    private final CaregiverSosRepository sosRepository;
    private final PatientRepository patientRepository;

    public SurveillanceService(SurveillanceReadingRepository readingRepository,
                               SurveillanceAlertRepository alertRepository,
                               CaregiverSosRepository sosRepository,
                               PatientRepository patientRepository) {
        this.readingRepository = readingRepository;
        this.alertRepository = alertRepository;
        this.sosRepository = sosRepository;
        this.patientRepository = patientRepository;
    }

    public SurveillanceReadingDTO recordReading(Long patientId, SurveillanceReadingRequest req) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));

        int score = req.getRiskScore() != null ? req.getRiskScore() : 0;
        SurveillanceReading reading = SurveillanceReading.builder()
                .patient(patient)
                .recordedAt(LocalDateTime.now())
                .readingType(req.getReadingType() != null ? req.getReadingType() : "VITALS")
                .heartRateBpm(req.getHeartRateBpm())
                .spo2Pct(req.getSpo2Pct())
                .bodyTempC(req.getBodyTempC())
                .activityLevel(req.getActivityLevel())
                .steps(req.getSteps())
                .sleepHours(req.getSleepHours())
                .hydrationGlasses(req.getHydrationGlasses())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .geofenceStatus(req.getGeofenceStatus())
                .locationLabel(req.getLocationLabel())
                .deviceId(req.getDeviceId())
                .networkType(req.getNetworkType())
                .syncStatus(req.getSyncStatus())
                .queuedPackets(req.getQueuedPackets())
                .batteryPct(req.getBatteryPct())
                .riskScore(score)
                .build();

        SurveillanceReading saved = readingRepository.save(reading);
        autoRaiseAlertFromReading(patient, saved);
        return toReadingDto(saved);
    }

    private void autoRaiseAlertFromReading(Patient patient, SurveillanceReading r) {
        List<SurveillanceAlert> toCreate = new ArrayList<>();

        if ("LOCATION".equals(r.getReadingType()) && "OUTSIDE".equalsIgnoreCase(r.getGeofenceStatus())) {
            toCreate.add(alert(patient, "WANDERING_GEOFENCE", "CRITICAL",
                    patient.getName() + " moved outside the safe geofence near " + safe(r.getLocationLabel()) + ".",
                    "SENSOR"));
        }
        if (r.getHeartRateBpm() != null && (r.getHeartRateBpm() > 120 || r.getHeartRateBpm() < 50)) {
            toCreate.add(alert(patient, "VITAL_ANOMALY", "HIGH",
                    "Abnormal heart rate detected: " + r.getHeartRateBpm() + " bpm for " + patient.getName() + ".",
                    "SENSOR"));
        }
        if (r.getSpo2Pct() != null && r.getSpo2Pct() < 92) {
            toCreate.add(alert(patient, "VITAL_ANOMALY", "CRITICAL",
                    "Low blood oxygen level: " + r.getSpo2Pct() + "% for " + patient.getName() + ".",
                    "SENSOR"));
        }
        if (r.getActivityLevel() != null && "LOW".equalsIgnoreCase(r.getActivityLevel())) {
            // Only raise low-activity if it looks anomalous via hydration/steps context below
        }
        if (r.getSteps() != null && r.getSteps() == 0) {
            toCreate.add(alert(patient, "LOW_ACTIVITY", "MODERATE",
                    "No detectable activity for " + patient.getName() + ". Possible prolonged inactivity.",
                    "SENSOR"));
        }

        for (SurveillanceAlert a : toCreate) {
            alertRepository.save(a);
        }
    }

    private SurveillanceAlert alert(Patient p, String type, String severity, String message, String source) {
        return SurveillanceAlert.builder()
                .patient(p)
                .alertType(type)
                .severity(severity)
                .message(message)
                .source(source)
                .resolved(false)
                .triggeredAt(LocalDateTime.now())
                .build();
    }

    public SurveillanceAlertDTO raiseAlert(Long patientId, SurveillanceAlertDTO dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));
        SurveillanceAlert alert = SurveillanceAlert.builder()
                .patient(patient)
                .alertType(dto.getAlertType() != null ? dto.getAlertType() : "VITAL_ANOMALY")
                .severity(dto.getSeverity() != null ? dto.getSeverity() : "HIGH")
                .message(dto.getMessage())
                .source(dto.getSource() != null ? dto.getSource() : "PATIENT_APP")
                .assignedAsha(dto.getAssignedAsha())
                .resolved(false)
                .triggeredAt(LocalDateTime.now())
                .build();
        return toAlertDto(alertRepository.save(alert));
    }

    @Transactional
    public CaregiverSosRequest processSos(Long patientId, CaregiverSosDTO dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        CaregiverSosRequest sos = CaregiverSosRequest.builder()
                .patient(patient)
                .patientLat(dto.getPatientLat())
                .patientLng(dto.getPatientLng())
                .locationLabel(dto.getLocationLabel())
                .status("PENDING")
                .requestedAt(LocalDateTime.now())
                .build();
        CaregiverSosRequest saved = sosRepository.save(sos);

        alertRepository.save(SurveillanceAlert.builder()
                .patient(patient)
                .alertType("SOS_CALL_CAREGIVER")
                .severity("CRITICAL")
                .message(patient.getName() + " requested caregiver assistance via the Call Caregiver button at " + safe(dto.getLocationLabel()) + ".")
                .source("PATIENT_APP")
                .resolved(false)
                .triggeredAt(LocalDateTime.now())
                .build());

        return saved;
    }

    public CaregiverSosRequest acknowledgeSos(Long sosId, String acknowledgedBy) {
        CaregiverSosRequest sos = sosRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS request not found: " + sosId));
        sos.setStatus("ACKNOWLEDGED");
        sos.setAcknowledgedBy(acknowledgedBy);
        sos.setAcknowledgedAt(LocalDateTime.now());
        return sosRepository.save(sos);
    }

    public List<SurveillanceAlertDTO> getAlerts(boolean unresolvedOnly) {
        List<SurveillanceAlert> alerts = unresolvedOnly
                ? alertRepository.findByResolvedFalseOrderByTriggeredAtDesc()
                : alertRepository.findTop50ByOrderByTriggeredAtDesc();
        return alerts.stream().map(this::toAlertDto).collect(Collectors.toList());
    }

    public SurveillanceAlertDTO resolveAlert(Long alertId, String resolvedBy) {
        SurveillanceAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
        alert.setResolved(true);
        alert.setResolvedAt(LocalDateTime.now());
        if (alert.getAssignedAsha() == null) alert.setAssignedAsha(resolvedBy);
        return toAlertDto(alertRepository.save(alert));
    }

    public List<CaregiverSosDTO> getSosRequests(String status) {
        List<CaregiverSosRequest> list = (status == null || status.isBlank())
                ? sosRepository.findTop20ByOrderByRequestedAtDesc()
                : sosRepository.findByStatusOrderByRequestedAtDesc(status);
        return list.stream().map(this::toSosDto).collect(Collectors.toList());
    }

    public CaregiverSosDTO getLatestSosForPatient(Long patientId) {
        return sosRepository.findTop5ByPatientIdOrderByRequestedAtDesc(patientId)
                .stream()
                .findFirst()
                .map(this::toSosDto)
                .orElse(null);
    }

    public List<PatientSurveillanceDTO> getAllSurveillanceSummary() {
        List<Patient> patients = patientRepository.findAll();
        Map<Long, Long> openAlertCounts = alertRepository.findByResolvedFalseOrderByTriggeredAtDesc().stream()
                .filter(a -> a.getPatient() != null)
                .collect(Collectors.groupingBy(a -> a.getPatient().getId(), Collectors.counting()));

        return patients.stream().map(p -> summarize(p, openAlertCounts.getOrDefault(p.getId(), 0L)))
                .collect(Collectors.toList());
    }

    public PatientSurveillanceDTO getPatientSurveillance(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));
        long open = alertRepository.countByResolvedFalse();
        return summarize(patient, open);
    }

    public List<SurveillanceReadingDTO> getHistory(Long patientId, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return readingRepository.findByPatientIdAndRecordedAtAfterOrderByRecordedAtAsc(patientId, since)
                .stream().map(this::toReadingDto).collect(Collectors.toList());
    }

    private SurveillanceReadingDTO toReadingDto(SurveillanceReading r) {
        return SurveillanceReadingDTO.builder()
                .id(r.getId())
                .patientId(r.getPatient() != null ? r.getPatient().getId() : null)
                .recordedAt(r.getRecordedAt())
                .readingType(r.getReadingType())
                .heartRateBpm(r.getHeartRateBpm())
                .spo2Pct(r.getSpo2Pct())
                .bodyTempC(r.getBodyTempC())
                .activityLevel(r.getActivityLevel())
                .steps(r.getSteps())
                .sleepHours(r.getSleepHours())
                .hydrationGlasses(r.getHydrationGlasses())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .geofenceStatus(r.getGeofenceStatus())
                .locationLabel(r.getLocationLabel())
                .deviceId(r.getDeviceId())
                .networkType(r.getNetworkType())
                .syncStatus(r.getSyncStatus())
                .queuedPackets(r.getQueuedPackets())
                .batteryPct(r.getBatteryPct())
                .riskScore(r.getRiskScore())
                .build();
    }

    private PatientSurveillanceDTO summarize(Patient patient, long openAlertCount) {
        Optional<SurveillanceReading> latest = readingRepository.findTopByPatientIdOrderByRecordedAtDesc(patient.getId());
        SurveillanceReading r = latest.orElse(null);

        int riskScore = r != null && r.getRiskScore() != null ? r.getRiskScore() : 0;
        if (openAlertCount > 0) riskScore = Math.max(riskScore, 65);
        String riskLevel = riskScore >= 75 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 25 ? "MODERATE" : "LOW";

        return PatientSurveillanceDTO.builder()
                .patientId(patient.getId())
                .patientName(patient.getName())
                .gender(patient.getGender())
                .preferredLanguage(patient.getPreferredLanguage())
                .district(extractDistrict(patient))
                .riskLevel(riskLevel)
                .riskScore(riskScore)
                .heartRateBpm(r != null ? r.getHeartRateBpm() : null)
                .spo2Pct(r != null ? r.getSpo2Pct() : null)
                .bodyTempC(r != null ? r.getBodyTempC() : null)
                .activityLevel(r != null ? r.getActivityLevel() : null)
                .steps(r != null ? r.getSteps() : null)
                .hydrationGlasses(r != null ? r.getHydrationGlasses() : null)
                .latitude(r != null ? r.getLatitude() : null)
                .longitude(r != null ? r.getLongitude() : null)
                .geofenceStatus(r != null ? r.getGeofenceStatus() : "UNKNOWN")
                .locationLabel(r != null ? r.getLocationLabel() : null)
                .syncStatus(r != null ? r.getSyncStatus() : null)
                .networkType(r != null ? r.getNetworkType() : null)
                .queuedPackets(r != null ? r.getQueuedPackets() : null)
                .batteryPct(r != null ? r.getBatteryPct() : null)
                .openAlertCount(openAlertCount)
                .lastSeen(r != null && r.getRecordedAt() != null ? r.getRecordedAt().toString() : null)
                .build();
    }

    private String extractDistrict(Patient patient) {
        if (patient.getCulturalBackground() != null && patient.getCulturalBackground().contains("Khasi")) return "East Khasi Hills";
        return "Majuli";
    }

    private String safe(String s) {
        return s == null || s.isBlank() ? "an unknown location" : s;
    }

    private SurveillanceAlertDTO toAlertDto(SurveillanceAlert a) {
        return SurveillanceAlertDTO.builder()
                .id(a.getId())
                .patientId(a.getPatient() != null ? a.getPatient().getId() : null)
                .patientName(a.getPatient() != null ? a.getPatient().getName() : null)
                .alertType(a.getAlertType())
                .severity(a.getSeverity())
                .message(a.getMessage())
                .source(a.getSource())
                .resolved(a.isResolved())
                .resolvedAt(a.getResolvedAt())
                .assignedAsha(a.getAssignedAsha())
                .triggeredAt(a.getTriggeredAt())
                .build();
    }

    private CaregiverSosDTO toSosDto(CaregiverSosRequest s) {
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

    /**
     * Seed generator used for the SIH demo. Creates ~24h of realistic
     * vitals/activity/location/heartbeat readings plus a couple of alerts and
     * one pending SOS referencing the existing patients.
     */
    @Transactional
    public Map<String, Object> simulate() {
        List<Patient> patients = patientRepository.findAll();
        if (patients.isEmpty()) {
            return Map.of("status", "NO_PATIENTS", "message", "No patients exist. Add a patient first.");
        }
        int readings = 0;
        int alerts = 0;

        Random rand = new Random();
        // NER landmark home coordinates per patient index
        double[][] homes = {
                {26.0574, 94.2331},   // Majuli, Assam (Biren Borah)
                {25.5788, 91.8933},   // East Khasi Hills (Mary Nongrum)
                {26.7417, 94.2026},   // Jorhat (extra)
        };

        for (int i = 0; i < patients.size(); i++) {
            Patient p = patients.get(i);
            double homeLat = homes[Math.min(i, homes.length - 1)][0];
            double homeLng = homes[Math.min(i, homes.length - 1)][1];

            boolean wandering = (i == 1); // make second patient wander outside

            // Rolling 24h of readings at ~2h intervals
            for (int h = 24; h >= 0; h -= 2) {
                LocalDateTime ts = LocalDateTime.now().minusHours(h);
                int hr = 62 + rand.nextInt(25);
                int spo2 = 93 + rand.nextInt(6);
                double temp = 36.1 + (rand.nextDouble() * 0.9);
                int steps = rand.nextInt(900);
                int hydration = rand.nextInt(5);
                boolean outside = wandering && h < 3;

                // VITALS
                readingRepository.save(SurveillanceReading.builder()
                        .patient(p).recordedAt(ts).readingType("VITALS")
                        .heartRateBpm(hr).spo2Pct((double) spo2).bodyTempC(temp)
                        .activityLevel(steps > 500 ? "HIGH" : steps > 100 ? "MODERATE" : "LOW")
                        .steps(steps).sleepHours(rand.nextDouble() * 6 + 2).hydrationGlasses(hydration)
                        .riskScore(outside ? 85 : Math.min(80, steps / 15))
                        .build());
                readings++;

                // LOCATION
                double lat = outside ? homeLat + 0.12 : homeLat + (rand.nextDouble() - 0.5) * 0.02;
                double lng = outside ? homeLng + 0.08 : homeLng + (rand.nextDouble() - 0.5) * 0.02;
                readingRepository.save(SurveillanceReading.builder()
                        .patient(p).recordedAt(ts).readingType("LOCATION")
                        .latitude(lat).longitude(lng)
                        .geofenceStatus(outside ? "OUTSIDE" : "INSIDE")
                        .locationLabel(outside ? "Beyond safe zone" : "Home")
                        .riskScore(outside ? 85 : 10)
                        .build());
                readings++;

                // DEVICE_HEARTBEAT
                readingRepository.save(SurveillanceReading.builder()
                        .patient(p).recordedAt(ts).readingType("DEVICE_HEARTBEAT")
                        .deviceId("CN-" + p.getId() + "-W1")
                        .networkType(h % 6 == 0 ? "2G_EDGE" : "4G")
                        .syncStatus(h % 6 == 0 ? "BUFFERED" : "SYNCED")
                        .queuedPackets(h % 6 == 0 ? rand.nextInt(20) + 5 : 0)
                        .batteryPct(rand.nextInt(40) + 55)
                        .riskScore(5)
                        .build());
                readings++;

                if (outside) {
                    alertRepository.save(SurveillanceAlert.builder()
                            .patient(p).alertType("WANDERING_GEOFENCE").severity("CRITICAL")
                            .message(p.getName() + " moved outside the safe geofence near " + (i == 1 ? "East Khasi Hills outskirts" : "Majuli river island") + ".")
                            .source("SENSOR").resolved(false).triggeredAt(ts)
                            .build());
                    alerts++;
                }
            }

            // One hydration deficit alert
            alertRepository.save(SurveillanceAlert.builder()
                    .patient(p).alertType("LOW_ACTIVITY").severity("MODERATE")
                    .message(p.getName() + " recorded low hydration activity today (2/6 glasses).")
                    .source("SIMULATOR").resolved(false).triggeredAt(LocalDateTime.now().minusHours(4))
                    .build());
            alerts++;
        }

        // One pending SOS from the first patient so the queue is demoable
        Patient first = patients.get(0);
        LocalDateTime sosTs = LocalDateTime.now().minusMinutes(6);
        sosRepository.save(CaregiverSosRequest.builder()
                .patient(first)
                .patientLat(homes[Math.min(0, homes.length - 1)][0])
                .patientLng(homes[Math.min(0, homes.length - 1)][1])
                .locationLabel("Home, " + extractDistrict(first))
                .status("PENDING")
                .requestedAt(sosTs)
                .build());
        alertRepository.save(SurveillanceAlert.builder()
                .patient(first).alertType("SOS_CALL_CAREGIVER").severity("CRITICAL")
                .message(first.getName() + " requested caregiver assistance via the Call Caregiver button.")
                .source("PATIENT_APP").resolved(false).triggeredAt(sosTs)
                .build());

        Map<String, Object> result = new HashMap<>();
        result.put("status", "OK");
        result.put("patients", patients.size());
        result.put("readingsCreated", readings);
        result.put("alertsCreated", alerts + 1);
        result.put("sosCreated", 1);
        log.info("Surveillance demo simulation complete: {} readings, {} alerts", readings, alerts + 1);
        return result;
    }
}
