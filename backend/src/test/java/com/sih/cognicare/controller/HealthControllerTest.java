package com.sih.cognicare.controller;

import com.sih.cognicare.dto.AdminOverviewDTO;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    @Mock
    private AdminService adminService;

    @InjectMocks
    private HealthController healthController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(healthController).build();
    }

    @Test
    @DisplayName("GET /health should return 200 OK with status UP and service name")
    void testCheckHealth() throws Exception {
        when(adminService.getOverview()).thenReturn(AdminOverviewDTO.builder()
                .ollamaStatus("UP")
                .build());

        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("cognicare-backend"))
                .andExpect(jsonPath("$.springOnline").value(true))
                .andExpect(jsonPath("$.llmOnline").value(true))
                .andExpect(jsonPath("$.llmStatus").value("UP"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /api/v1/health should route to health check properly")
    void testApiV1Health() throws Exception {
        when(adminService.getOverview()).thenReturn(AdminOverviewDTO.builder()
                .ollamaStatus("DOWN")
                .build());

        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.llmOnline").value(false))
                .andExpect(jsonPath("$.llmStatus").value("DOWN"));
    }

    @Test
    @DisplayName("GET /healthz should also return 200 OK for k8s / docker probes")
    void testHealthz() throws Exception {
        when(adminService.getOverview()).thenReturn(AdminOverviewDTO.builder()
                .ollamaStatus("UP")
                .build());

        mockMvc.perform(get("/healthz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
