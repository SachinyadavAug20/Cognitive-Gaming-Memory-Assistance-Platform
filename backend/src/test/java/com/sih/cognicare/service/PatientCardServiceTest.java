package com.sih.cognicare.service;

import com.sih.cognicare.dto.GenerateCardResponse;
import com.sih.cognicare.dto.KioskScanResponse;
import com.sih.cognicare.exception.InvalidQrTokenException;
import com.sih.cognicare.exception.PatientNotFoundException;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.model.PatientCard;
import com.sih.cognicare.repository.PatientCardRepository;
import com.sih.cognicare.repository.PatientRepository;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientCardServiceTest {

    @Mock
    private PatientCardRepository patientCardRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private PatientCardService patientCardService;

    private Patient testPatient;
    private PatientCard activeCard;

    @BeforeEach
    void setUp() {
        testPatient = Patient.builder()
                .id(2L)
                .name("Biren Borah")
                .preferredLanguage("as")
                .build();

        activeCard = PatientCard.builder()
                .id(UUID.randomUUID())
                .patientId(2L)
                .secureToken("token-uuid-1234")
                .isActive(true)
                .issuedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return existing active card if present")
    void testGetCardExisting() {
        when(patientRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(patientCardRepository.findTopByPatientIdAndIsActiveTrue(2L)).thenReturn(Optional.of(activeCard));

        GenerateCardResponse response = patientCardService.getCard(2L);

        assertNotNull(response);
        assertEquals(2L, response.getPatientId());
        assertEquals("Biren Borah", response.getPatientName());
        assertEquals("token-uuid-1234", response.getSecureToken());
        assertTrue(response.isActive());
        verify(patientCardRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should generate a new card if no active card exists")
    void testGetCardWhenNoneExists() {
        when(patientRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(patientCardRepository.findTopByPatientIdAndIsActiveTrue(2L)).thenReturn(Optional.empty());
        when(patientCardRepository.findAllByPatientIdAndIsActiveTrue(2L)).thenReturn(Collections.emptyList());

        GenerateCardResponse response = patientCardService.getCard(2L);

        assertNotNull(response);
        assertEquals(2L, response.getPatientId());
        assertNotNull(response.getSecureToken());
        assertTrue(response.isActive());
        verify(patientCardRepository).save(any(PatientCard.class));
    }

    @Test
    @DisplayName("Should map patientId 101 to DEMO_PATIENT_ID (2L)")
    void testGetCardForPatientId101() {
        when(patientRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(patientCardRepository.findTopByPatientIdAndIsActiveTrue(2L)).thenReturn(Optional.of(activeCard));

        GenerateCardResponse response = patientCardService.getCard(101L);

        assertNotNull(response);
        assertEquals(2L, response.getPatientId());
        verify(patientRepository).findById(2L);
    }

    @Test
    @DisplayName("Should throw PatientNotFoundException when patient does not exist")
    void testGetCardPatientNotFound() {
        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PatientNotFoundException.class, () -> patientCardService.getCard(999L));
    }

    @Test
    @DisplayName("Should deactivate previous cards when generating a new card")
    void testGenerateCardDeactivatesPreviousCards() {
        when(patientRepository.findById(2L)).thenReturn(Optional.of(testPatient));

        PatientCard oldCard1 = PatientCard.builder().id(UUID.randomUUID()).patientId(2L).isActive(true).secureToken("old-1").build();
        PatientCard oldCard2 = PatientCard.builder().id(UUID.randomUUID()).patientId(2L).isActive(true).secureToken("old-2").build();
        when(patientCardRepository.findAllByPatientIdAndIsActiveTrue(2L)).thenReturn(List.of(oldCard1, oldCard2));

        GenerateCardResponse response = patientCardService.generateCard(2L);

        assertFalse(oldCard1.isActive(), "Old card 1 must be marked inactive");
        assertFalse(oldCard2.isActive(), "Old card 2 must be marked inactive");
        verify(patientCardRepository).saveAll(List.of(oldCard1, oldCard2));

        ArgumentCaptor<PatientCard> newCardCaptor = ArgumentCaptor.forClass(PatientCard.class);
        verify(patientCardRepository).save(newCardCaptor.capture());
        PatientCard savedNewCard = newCardCaptor.getValue();
        assertTrue(savedNewCard.isActive());
        assertEquals(2L, savedNewCard.getPatientId());
        assertNotNull(savedNewCard.getSecureToken());
        assertEquals(savedNewCard.getSecureToken(), response.getSecureToken());
    }

    @Test
    @DisplayName("Should successfully login via demo login")
    void testDemoLogin() {
        when(patientRepository.findById(PatientCardService.DEMO_PATIENT_ID)).thenReturn(Optional.of(testPatient));
        when(jwtService.generateToken(2L)).thenReturn("demo-jwt-token-xyz");

        KioskScanResponse response = patientCardService.demoLogin();

        assertNotNull(response);
        assertEquals("demo-jwt-token-xyz", response.getToken());
        assertEquals(2L, response.getPatient().getId());
        assertEquals("Biren Borah", response.getPatient().getName());
        assertEquals("as", response.getPatient().getLanguagePreference());
    }

    @Test
    @DisplayName("Should scan valid active QR token and return JWT and profile")
    void testScanValidQr() {
        when(patientCardRepository.findTopBySecureTokenAndIsActiveTrue("token-uuid-1234"))
                .thenReturn(Optional.of(activeCard));
        when(patientRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(jwtService.generateToken(2L)).thenReturn("mock-valid-jwt");

        KioskScanResponse response = patientCardService.scan("token-uuid-1234");

        assertNotNull(response);
        assertEquals("mock-valid-jwt", response.getToken());
        assertEquals(2L, response.getPatient().getId());
        assertEquals("Biren Borah", response.getPatient().getName());
    }

    @Test
    @DisplayName("Should throw InvalidQrTokenException when QR token is not recognized or card is inactive")
    void testScanInvalidQrToken() {
        when(patientCardRepository.findTopBySecureTokenAndIsActiveTrue("invalid-qr"))
                .thenReturn(Optional.empty());

        assertThrows(InvalidQrTokenException.class, () -> patientCardService.scan("invalid-qr"));
    }
}
