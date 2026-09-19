package com.sih.cognicare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.KioskScanRequest;
import com.sih.cognicare.dto.KioskScanResponse;
import com.sih.cognicare.dto.PatientProfileResponse;
import com.sih.cognicare.exception.GlobalExceptionHandler;
import com.sih.cognicare.exception.InvalidQrTokenException;
import com.sih.cognicare.service.PatientCardService;
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

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class KioskAuthControllerTest {

    @Mock
    private PatientCardService patientCardService;

    @InjectMocks
    private KioskAuthController kioskAuthController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(kioskAuthController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/auth/kiosk/scan should return 200 OK when QR token is valid")
    void testScanValidQr() throws Exception {
        PatientProfileResponse profile = PatientProfileResponse.builder()
                .id(2L)
                .name("Biren Borah")
                .languagePreference("as")
                .build();

        KioskScanResponse response = KioskScanResponse.builder()
                .token("jwt-mock-token-xyz")
                .patient(profile)
                .build();

        when(patientCardService.scan(eq("valid-qr-data"))).thenReturn(response);

        KioskScanRequest request = new KioskScanRequest("valid-qr-data");

        mockMvc.perform(post("/api/v1/auth/kiosk/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-mock-token-xyz"))
                .andExpect(jsonPath("$.patient.id").value(2))
                .andExpect(jsonPath("$.patient.name").value("Biren Borah"))
                .andExpect(jsonPath("$.patient.languagePreference").value("as"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/kiosk/scan should return 401 UNAUTHORIZED when QR token is invalid")
    void testScanInvalidQr() throws Exception {
        when(patientCardService.scan(eq("bad-qr"))).thenThrow(new InvalidQrTokenException());

        KioskScanRequest request = new KioskScanRequest("bad-qr");

        mockMvc.perform(post("/api/v1/auth/kiosk/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/kiosk/scan should return 400 BAD_REQUEST when qrData is blank")
    void testScanBlankQrData() throws Exception {
        KioskScanRequest request = new KioskScanRequest("   ");

        mockMvc.perform(post("/api/v1/auth/kiosk/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/kiosk/demo should return 200 OK with demo session")
    void testDemoLogin() throws Exception {
        PatientProfileResponse profile = PatientProfileResponse.builder()
                .id(2L)
                .name("Biren Borah")
                .languagePreference("as")
                .build();

        KioskScanResponse response = KioskScanResponse.builder()
                .token("demo-token-123")
                .patient(profile)
                .build();

        when(patientCardService.demoLogin()).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/kiosk/demo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("demo-token-123"))
                .andExpect(jsonPath("$.patient.name").value("Biren Borah"));
    }
}
