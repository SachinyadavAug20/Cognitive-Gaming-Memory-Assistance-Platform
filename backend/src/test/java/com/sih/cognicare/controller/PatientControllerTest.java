package com.sih.cognicare.controller;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.exception.GlobalExceptionHandler;
import com.sih.cognicare.exception.PatientNotFoundException;
import com.sih.cognicare.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PatientControllerTest {

    @Mock
    private PatientService patientService;

    @InjectMocks
    private PatientController patientController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/patients should return list of patients")
    void testGetAllPatients() throws Exception {
        PatientProfileResponse p1 = PatientProfileResponse.builder().id(1L).name("Biren Borah").build();
        PatientProfileResponse p2 = PatientProfileResponse.builder().id(2L).name("Mary Nongrum").build();

        when(patientService.getAllPatients()).thenReturn(List.of(p1, p2));

        mockMvc.perform(get("/api/v1/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Biren Borah"))
                .andExpect(jsonPath("$[1].name").value("Mary Nongrum"));
    }

    @Test
    @DisplayName("GET /api/v1/patients/{id} should return patient detail")
    void testGetPatientDetail() throws Exception {
        PatientDetailResponse detail = PatientDetailResponse.builder()
                .id(1L)
                .name("Biren Borah")
                .preferredLanguage("as")
                .build();

        when(patientService.getPatientDetail(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/patients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Biren Borah"))
                .andExpect(jsonPath("$.preferredLanguage").value("as"));
    }

    @Test
    @DisplayName("GET /api/v1/patients/{id} should return 404 when patient does not exist")
    void testGetPatientDetailNotFound() throws Exception {
        when(patientService.getPatientDetail(999L)).thenThrow(new PatientNotFoundException(999L));

        mockMvc.perform(get("/api/v1/patients/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("GET /api/v1/patients/{id}/family should return family members")
    void testGetFamilyMembers() throws Exception {
        FamilyMemberResponse fm = FamilyMemberResponse.builder()
                .id(10L)
                .name("Pratima Borah")
                .relation("Spouse")
                .build();

        when(patientService.getPatientFamilyMembers(1L)).thenReturn(List.of(fm));

        mockMvc.perform(get("/api/v1/patients/1/family"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Pratima Borah"))
                .andExpect(jsonPath("$[0].relation").value("Spouse"));
    }

    @Test
    @DisplayName("GET /api/v1/patients/{id}/places should return familiar places")
    void testGetFamiliarPlaces() throws Exception {
        FamiliarPlaceResponse fp = FamiliarPlaceResponse.builder()
                .id(20L)
                .name("Silpukhuri Lake")
                .category("Home Landmark")
                .build();

        when(patientService.getPatientFamiliarPlaces(1L)).thenReturn(List.of(fp));

        mockMvc.perform(get("/api/v1/patients/1/places"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Silpukhuri Lake"));
    }

    @Test
    @DisplayName("GET /api/v1/patients/{id}/medical-profile should return 404 when profile is null")
    void testGetMedicalProfileNotFound() throws Exception {
        when(patientService.getPatientMedicalProfile(999L)).thenReturn(null);

        mockMvc.perform(get("/api/v1/patients/999/medical-profile"))
                .andExpect(status().isNotFound());
    }
}
