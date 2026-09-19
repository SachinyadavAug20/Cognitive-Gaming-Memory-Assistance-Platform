package com.sih.cognicare.controller;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.service.AdminService;
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
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    @InjectMocks
    private AdminController adminController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
    }

    @Test
    @DisplayName("GET /api/v1/admin/overview should return overview stats")
    void testGetOverview() throws Exception {
        AdminOverviewDTO overview = AdminOverviewDTO.builder()
                .totalPatients(15L)
                .activeCards(14L)
                .totalSessions(210L)
                .dbStatus("UP")
                .ollamaStatus("UP")
                .build();

        when(adminService.getOverview()).thenReturn(overview);

        mockMvc.perform(get("/api/v1/admin/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients").value(15))
                .andExpect(jsonPath("$.activeCards").value(14))
                .andExpect(jsonPath("$.totalSessions").value(210))
                .andExpect(jsonPath("$.dbStatus").value("UP"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/patients should return admin patient list")
    void testGetAllPatients() throws Exception {
        AdminPatientRowDTO row = AdminPatientRowDTO.builder()
                .id(1L)
                .name("Biren Borah")
                .hasActiveCard(true)
                .build();

        when(adminService.getAllPatients()).thenReturn(List.of(row));

        mockMvc.perform(get("/api/v1/admin/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Biren Borah"))
                .andExpect(jsonPath("$[0].hasActiveCard").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/admin/cards/{id}/revoke should revoke card and return 200")
    void testRevokeCards() throws Exception {
        when(adminService.revokeCards(1L)).thenReturn(Map.of(
                "status", "SUCCESS",
                "patientId", 1L,
                "revokedCount", 1
        ));

        mockMvc.perform(post("/api/v1/admin/cards/1/revoke"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.revokedCount").value(1));
    }

    @Test
    @DisplayName("POST /api/v1/admin/cards/{id}/reissue should reissue card and return 200")
    void testReissueCard() throws Exception {
        GenerateCardResponse response = GenerateCardResponse.builder()
                .patientId(1L)
                .patientName("Biren Borah")
                .secureToken("new-reissued-token")
                .isActive(true)
                .build();

        when(adminService.reissueCard(1L)).thenReturn(response);

        mockMvc.perform(post("/api/v1/admin/cards/1/reissue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientId").value(1))
                .andExpect(jsonPath("$.secureToken").value("new-reissued-token"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/ner-districts should return district telemetry")
    void testGetNerDistricts() throws Exception {
        AdminDistrictHealthDTO d = AdminDistrictHealthDTO.builder()
                .district("Kamrup Metropolitan")
                .state("Assam")
                .enrolledPatients(12)
                .build();

        when(adminService.getNerDistricts()).thenReturn(List.of(d));

        mockMvc.perform(get("/api/v1/admin/ner-districts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].district").value("Kamrup Metropolitan"));
    }
}
