package com.sih.cognicare.service;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.model.PatientCard;
import com.sih.cognicare.repository.GameSessionRepository;
import com.sih.cognicare.repository.PatientCardRepository;
import com.sih.cognicare.repository.PatientRepository;
import com.sih.cognicare.service.impl.AdminRegionalSeedDataProvider;
import com.sih.cognicare.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientCardRepository patientCardRepository;

    @Mock
    private GameSessionRepository gameSessionRepository;

    @Mock
    private PatientCardService patientCardService;

    private AdminServiceImpl adminService;
    private AdminRegionalSeedDataProvider seedDataProvider;

    @BeforeEach
    void setUp() {
        seedDataProvider = new AdminRegionalSeedDataProvider();
        adminService = new AdminServiceImpl(
                patientRepository,
                patientCardRepository,
                gameSessionRepository,
                patientCardService,
                seedDataProvider
        );
    }

    @Test
    @DisplayName("Should return overview statistics accurately")
    void testGetOverview() {
        when(patientRepository.count()).thenReturn(14L);
        when(patientCardRepository.countByIsActiveTrue()).thenReturn(12L);
        when(gameSessionRepository.count()).thenReturn(150L);

        AdminOverviewDTO overview = adminService.getOverview();

        assertNotNull(overview);
        assertEquals(14L, overview.getTotalPatients());
        assertEquals(12L, overview.getActiveCards());
        assertEquals(150L, overview.getTotalSessions());
        assertEquals("UP", overview.getDbStatus());
    }

    @Test
    @DisplayName("Should return all patients with masked card tokens")
    void testGetAllPatients() {
        Patient p = Patient.builder()
                .id(1L)
                .name("Biren Borah")
                .gender("Male")
                .preferredLanguage("as")
                .phone("+919435012345")
                .build();

        PatientCard card = PatientCard.builder()
                .id(UUID.randomUUID())
                .patientId(1L)
                .secureToken("abcdef1234567890xyz")
                .isActive(true)
                .build();

        when(patientRepository.findAll()).thenReturn(List.of(p));
        when(patientCardRepository.findTopByPatientIdAndIsActiveTrue(1L)).thenReturn(Optional.of(card));

        List<AdminPatientRowDTO> patients = adminService.getAllPatients();

        assertNotNull(patients);
        assertEquals(1, patients.size());
        AdminPatientRowDTO row = patients.get(0);
        assertEquals("Biren Borah", row.getName());
        assertTrue(row.isHasActiveCard());
        assertTrue(row.getActiveCardToken().startsWith("abcdef..."));
    }

    @Test
    @DisplayName("Should revoke all active cards for a patient")
    void testRevokeCards() {
        PatientCard card1 = PatientCard.builder().id(UUID.randomUUID()).patientId(1L).isActive(true).build();
        PatientCard card2 = PatientCard.builder().id(UUID.randomUUID()).patientId(1L).isActive(false).build();

        when(patientCardRepository.findAllByPatientId(1L)).thenReturn(List.of(card1, card2));

        Map<String, Object> result = adminService.revokeCards(1L);

        assertNotNull(result);
        assertEquals("SUCCESS", result.get("status"));
        assertEquals(1, result.get("revokedCount"));
        assertFalse(card1.isActive());
        verify(patientCardRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Should reissue a fresh card for a patient via PatientCardService")
    void testReissueCard() {
        GenerateCardResponse mockResponse = GenerateCardResponse.builder()
                .patientId(2L)
                .secureToken("reissued-token-abc")
                .isActive(true)
                .build();

        when(patientCardService.generateCard(2L)).thenReturn(mockResponse);

        GenerateCardResponse response = adminService.reissueCard(2L);

        assertNotNull(response);
        assertEquals(2L, response.getPatientId());
        assertEquals("reissued-token-abc", response.getSecureToken());
        verify(patientCardService).generateCard(2L);
    }

    @Test
    @DisplayName("Should retrieve NER districts with non-empty health metrics")
    void testGetNerDistricts() {
        List<AdminDistrictHealthDTO> districts = adminService.getNerDistricts();
        assertNotNull(districts);
        assertFalse(districts.isEmpty());
        assertTrue(districts.stream().anyMatch(d -> d.getDistrict().equals("Kamrup Metropolitan")));
    }

    @Test
    @DisplayName("Should retrieve seeded ASHA workers")
    void testGetAshaWorkers() {
        List<AdminAshaWorkerDTO> workers = adminService.getAshaWorkers();
        assertNotNull(workers);
        assertFalse(workers.isEmpty());
    }
}
