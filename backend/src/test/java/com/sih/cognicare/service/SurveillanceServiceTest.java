package com.sih.cognicare.service;

import com.sih.cognicare.dto.CaregiverSosDTO;
import com.sih.cognicare.dto.SurveillanceAlertDTO;
import com.sih.cognicare.dto.SurveillanceReadingDTO;
import com.sih.cognicare.dto.SurveillanceReadingRequest;
import com.sih.cognicare.exception.PatientNotFoundException;
import com.sih.cognicare.model.CaregiverSosRequest;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.model.SurveillanceAlert;
import com.sih.cognicare.model.SurveillanceReading;
import com.sih.cognicare.repository.CaregiverSosRepository;
import com.sih.cognicare.repository.PatientRepository;
import com.sih.cognicare.repository.SurveillanceAlertRepository;
import com.sih.cognicare.repository.SurveillanceReadingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SurveillanceServiceTest {

    @Mock
    private SurveillanceReadingRepository readingRepository;

    @Mock
    private SurveillanceAlertRepository alertRepository;

    @Mock
    private CaregiverSosRepository sosRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private SurveillanceService surveillanceService;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = Patient.builder()
                .id(1L)
                .name("Biren Borah")
                .preferredLanguage("as")
                .build();
    }

    @Test
    @DisplayName("Should record normal reading without triggering abnormal vital alerts")
    void testRecordNormalReading() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        SurveillanceReadingRequest request = new SurveillanceReadingRequest();
        request.setReadingType("VITALS");
        request.setHeartRateBpm(72);
        request.setSpo2Pct(98.0);
        request.setSteps(1200);

        when(readingRepository.save(any(SurveillanceReading.class))).thenAnswer(inv -> {
            SurveillanceReading r = inv.getArgument(0);
            r.setId(10L);
            return r;
        });

        SurveillanceReadingDTO dto = surveillanceService.recordReading(1L, request);

        assertNotNull(dto);
        assertEquals(72, dto.getHeartRateBpm());
        assertEquals(98, dto.getSpo2Pct());
        verify(alertRepository, never()).save(any(SurveillanceAlert.class));
    }

    @Test
    @DisplayName("Should trigger critical vital alerts when SpO2 is low and heart rate is high")
    void testRecordAnomalousVitalsTriggersAlerts() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        SurveillanceReadingRequest request = new SurveillanceReadingRequest();
        request.setReadingType("VITALS");
        request.setHeartRateBpm(135); // > 120
        request.setSpo2Pct(88.0);       // < 92

        when(readingRepository.save(any(SurveillanceReading.class))).thenAnswer(inv -> {
            SurveillanceReading r = inv.getArgument(0);
            r.setId(11L);
            return r;
        });

        surveillanceService.recordReading(1L, request);

        ArgumentCaptor<SurveillanceAlert> alertCaptor = ArgumentCaptor.forClass(SurveillanceAlert.class);
        verify(alertRepository, times(2)).save(alertCaptor.capture());

        List<SurveillanceAlert> savedAlerts = alertCaptor.getAllValues();
        assertTrue(savedAlerts.stream().anyMatch(a -> a.getSeverity().equals("HIGH") && a.getMessage().contains("135 bpm")));
        assertTrue(savedAlerts.stream().anyMatch(a -> a.getSeverity().equals("CRITICAL") && a.getMessage().contains("88")));
    }

    @Test
    @DisplayName("Should trigger critical wandering geofence alert when patient is OUTSIDE")
    void testWanderingGeofenceAlert() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        SurveillanceReadingRequest request = new SurveillanceReadingRequest();
        request.setReadingType("LOCATION");
        request.setGeofenceStatus("OUTSIDE");
        request.setLocationLabel("Silpukhuri Main Road");

        when(readingRepository.save(any(SurveillanceReading.class))).thenAnswer(inv -> inv.getArgument(0));

        surveillanceService.recordReading(1L, request);

        ArgumentCaptor<SurveillanceAlert> alertCaptor = ArgumentCaptor.forClass(SurveillanceAlert.class);
        verify(alertRepository).save(alertCaptor.capture());
        SurveillanceAlert alert = alertCaptor.getValue();
        assertEquals("WANDERING_GEOFENCE", alert.getAlertType());
        assertEquals("CRITICAL", alert.getSeverity());
        assertTrue(alert.getMessage().contains("moved outside the safe geofence"));
    }

    @Test
    @DisplayName("Should raise manual clinical alert successfully")
    void testRaiseManualAlert() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        SurveillanceAlertDTO alertDTO = new SurveillanceAlertDTO();
        alertDTO.setAlertType("MEDICATION_MISSED");
        alertDTO.setSeverity("MEDIUM");
        alertDTO.setMessage("Missed morning blood pressure tablet");
        alertDTO.setSource("CLINICAL_PORTAL");

        when(alertRepository.save(any(SurveillanceAlert.class))).thenAnswer(inv -> {
            SurveillanceAlert a = inv.getArgument(0);
            a.setId(55L);
            return a;
        });

        SurveillanceAlertDTO result = surveillanceService.raiseAlert(1L, alertDTO);

        assertNotNull(result);
        assertEquals("MEDICATION_MISSED", result.getAlertType());
        assertEquals("MEDIUM", result.getSeverity());
        assertEquals("Missed morning blood pressure tablet", result.getMessage());
    }

    @Test
    @DisplayName("Should process Caregiver SOS and log critical alert")
    void testProcessSos() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        CaregiverSosDTO sosDto = CaregiverSosDTO.builder()
                .patientId(1L)
                .locationLabel("Home Courtyard")
                .patientLat(26.18)
                .patientLng(91.75)
                .build();

        when(sosRepository.save(any(CaregiverSosRequest.class))).thenAnswer(inv -> {
            CaregiverSosRequest req = inv.getArgument(0);
            req.setId(100L);
            return req;
        });

        CaregiverSosRequest result = surveillanceService.processSos(1L, sosDto);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("PENDING", result.getStatus());

        verify(alertRepository).save(argThat(alert ->
                "SOS_CALL_CAREGIVER".equals(alert.getAlertType()) &&
                "CRITICAL".equals(alert.getSeverity())
        ));
    }

    @Test
    @DisplayName("Should acknowledge SOS successfully")
    void testAcknowledgeSos() {
        CaregiverSosRequest pendingSos = CaregiverSosRequest.builder()
                .id(100L)
                .status("PENDING")
                .build();

        when(sosRepository.findById(100L)).thenReturn(Optional.of(pendingSos));
        when(sosRepository.save(any(CaregiverSosRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        CaregiverSosRequest acked = surveillanceService.acknowledgeSos(100L, "ASHA_Worker_Ananya");

        assertEquals("ACKNOWLEDGED", acked.getStatus());
        assertEquals("ASHA_Worker_Ananya", acked.getAcknowledgedBy());
        assertNotNull(acked.getAcknowledgedAt());
    }

    @Test
    @DisplayName("Should throw PatientNotFoundException when processing SOS for unknown patient")
    void testProcessSosPatientNotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PatientNotFoundException.class, () ->
                surveillanceService.processSos(999L, CaregiverSosDTO.builder().build()));
    }
}
