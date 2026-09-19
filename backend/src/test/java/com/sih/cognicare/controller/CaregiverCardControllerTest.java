package com.sih.cognicare.controller;

import com.sih.cognicare.dto.GenerateCardResponse;
import com.sih.cognicare.exception.GlobalExceptionHandler;
import com.sih.cognicare.exception.PatientNotFoundException;
import com.sih.cognicare.service.PatientCardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CaregiverCardControllerTest {

    @Mock
    private PatientCardService patientCardService;

    @InjectMocks
    private CaregiverCardController caregiverCardController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(caregiverCardController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/caregiver/patients/{id}/card should return 200 with active card")
    void testGetCard() throws Exception {
        GenerateCardResponse response = GenerateCardResponse.builder()
                .patientId(2L)
                .patientName("Biren Borah")
                .secureToken("token-xyz")
                .isActive(true)
                .issuedAt(LocalDateTime.now())
                .build();

        when(patientCardService.getCard(2L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/caregiver/patients/2/card"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientId").value(2))
                .andExpect(jsonPath("$.patientName").value("Biren Borah"))
                .andExpect(jsonPath("$.secureToken").value("token-xyz"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/caregiver/patients/{id}/card should generate new card and return 200")
    void testGenerateCard() throws Exception {
        GenerateCardResponse response = GenerateCardResponse.builder()
                .patientId(2L)
                .patientName("Biren Borah")
                .secureToken("new-token-123")
                .isActive(true)
                .issuedAt(LocalDateTime.now())
                .build();

        when(patientCardService.generateCard(2L)).thenReturn(response);

        mockMvc.perform(post("/api/v1/caregiver/patients/2/card"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientId").value(2))
                .andExpect(jsonPath("$.secureToken").value("new-token-123"));
    }

    @Test
    @DisplayName("GET /api/v1/caregiver/patients/{id}/card should return 404 when patient not found")
    void testGetCardNotFound() throws Exception {
        when(patientCardService.getCard(999L)).thenThrow(new PatientNotFoundException(999L));

        mockMvc.perform(get("/api/v1/caregiver/patients/999/card"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }
}
