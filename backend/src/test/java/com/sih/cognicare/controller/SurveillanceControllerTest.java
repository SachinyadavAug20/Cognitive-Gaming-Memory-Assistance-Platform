package com.sih.cognicare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.CaregiverSosRequest;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.service.SurveillanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SurveillanceControllerTest {

    @Mock
    private SurveillanceService surveillanceService;

    @InjectMocks
    private SurveillanceController surveillanceController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(surveillanceController).build();
    }

    @Test
    @DisplayName("POST /api/v1/surveillance/patients/{id}/readings should record telemetry and return 200 OK")
    void testRecordReading() throws Exception {
        SurveillanceReadingDTO dto = SurveillanceReadingDTO.builder()
                .id(10L)
                .patientId(1L)
                .readingType("VITALS")
                .heartRateBpm(75)
                .spo2Pct(98.5)
                .build();

        when(surveillanceService.recordReading(eq(1L), any(SurveillanceReadingRequest.class)))
                .thenReturn(dto);

        SurveillanceReadingRequest req = new SurveillanceReadingRequest();
        req.setReadingType("VITALS");
        req.setHeartRateBpm(75);

        mockMvc.perform(post("/api/v1/surveillance/patients/1/readings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.heartRateBpm").value(75));
    }

    @Test
    @DisplayName("POST /api/v1/surveillance/patients/{id}/alerts should raise alert and return 200 OK")
    void testRaiseAlert() throws Exception {
        SurveillanceAlertDTO alertDto = SurveillanceAlertDTO.builder()
                .id(20L)
                .patientId(1L)
                .alertType("GEOFENCE_BREACH")
                .severity("CRITICAL")
                .message("Patient stepped out of safe zone")
                .build();

        when(surveillanceService.raiseAlert(eq(1L), any(SurveillanceAlertDTO.class)))
                .thenReturn(alertDto);

        mockMvc.perform(post("/api/v1/surveillance/patients/1/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(alertDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.severity").value("CRITICAL"));
    }

    @Test
    @DisplayName("POST /api/v1/surveillance/patients/{id}/sos should process SOS and return 200 OK")
    void testProcessSos() throws Exception {
        Patient p = Patient.builder().id(1L).name("Biren Borah").build();
        CaregiverSosRequest req = CaregiverSosRequest.builder()
                .id(30L)
                .patient(p)
                .locationLabel("Garden")
                .status("PENDING")
                .requestedAt(LocalDateTime.now())
                .build();

        when(surveillanceService.processSos(eq(1L), any(CaregiverSosDTO.class)))
                .thenReturn(req);

        CaregiverSosDTO dto = CaregiverSosDTO.builder()
                .patientId(1L)
                .locationLabel("Garden")
                .build();

        mockMvc.perform(post("/api/v1/surveillance/patients/1/sos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(30))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/v1/surveillance/patients/{id}/sos/latest should return 204 when no SOS active")
    void testGetLatestSosNoContent() throws Exception {
        when(surveillanceService.getLatestSosForPatient(1L)).thenReturn(null);

        mockMvc.perform(get("/api/v1/surveillance/patients/1/sos/latest"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/admin/surveillance/patients should return summary list")
    void testGetAllSurveillanceSummary() throws Exception {
        PatientSurveillanceDTO p1 = PatientSurveillanceDTO.builder()
                .patientId(1L)
                .patientName("Biren Borah")
                .riskScore(15)
                .riskLevel("LOW")
                .build();

        when(surveillanceService.getAllSurveillanceSummary()).thenReturn(List.of(p1));

        mockMvc.perform(get("/api/v1/admin/surveillance/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].patientName").value("Biren Borah"))
                .andExpect(jsonPath("$[0].riskLevel").value("LOW"));
    }
}
