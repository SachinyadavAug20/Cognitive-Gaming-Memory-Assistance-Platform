package com.sih.cognicare.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.*;
import com.sih.cognicare.service.impl.PatientDtoMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PatientDtoMapperTest {

    private PatientDtoMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new PatientDtoMapper(new ObjectMapper());
    }

    @Test
    @DisplayName("Should build Patient entity from OnboardRequest correctly")
    void testBuildPatientEntity() {
        OnboardRequest request = new OnboardRequest();
        request.setCaregiverId(501L);

        OnboardRequest.PersonalInfo personal = new OnboardRequest.PersonalInfo();
        personal.setFullName("Lalthanmawii Sailo");
        personal.setDateOfBirth("1952-04-12");
        personal.setGender("Female");
        personal.setPhone("+919876543210");
        personal.setRelationship("Daughter");
        request.setPersonal(personal);

        OnboardRequest.LifeStoryRequest ls = new OnboardRequest.LifeStoryRequest();
        ls.setPreferredLanguage("lus");
        ls.setCulturalBackground("Mizoram hills");
        ls.setJoyNote("Singing choir hymns");
        request.setLifeStory(ls);

        Patient patient = mapper.buildPatientEntity(request);

        assertNotNull(patient);
        assertEquals("Lalthanmawii Sailo", patient.getName());
        assertEquals(LocalDate.of(1952, 4, 12), patient.getDob());
        assertEquals("Female", patient.getGender());
        assertEquals("+919876543210", patient.getPhone());
        assertEquals("Daughter", patient.getRelationship());
        assertEquals(501L, patient.getCaregiverId());
        assertEquals("lus", patient.getPreferredLanguage());
        assertEquals("Mizoram hills", patient.getCulturalBackground());
        assertEquals("Singing choir hymns", patient.getJoyTriggers());
    }

    @Test
    @DisplayName("Should build base medical profile with expected default clinical stage")
    void testBuildBaseMedicalProfile() {
        Patient patient = Patient.builder().id(10L).name("Test Patient").build();
        MedicalProfile profile = mapper.buildBaseMedicalProfile(patient);

        assertNotNull(profile);
        assertEquals(patient, profile.getPatient());
        assertEquals("Pending Diagnosis", profile.getDiagnosis());
        assertEquals("MCI", profile.getClinicalStage());
        assertEquals(1, profile.getRecommendedStartDifficulty());
    }

    @Test
    @DisplayName("Should convert Patient to PatientProfileResponse")
    void testToPatientProfileResponse() {
        Patient patient = Patient.builder()
                .id(2L)
                .name("Biren Borah")
                .preferredLanguage("as")
                .dob(LocalDate.of(1948, 8, 15))
                .build();

        PatientProfileResponse dto = mapper.toPatientProfileResponse(patient);

        assertNotNull(dto);
        assertEquals(2L, dto.getId());
        assertEquals("Biren Borah", dto.getName());
        assertEquals("as", dto.getLanguagePreference());
        assertEquals(LocalDate.of(1948, 8, 15), dto.getDob());
    }

    @Test
    @DisplayName("Should convert full Patient graph into PatientDetailResponse")
    void testToPatientDetailResponse() {
        Patient patient = Patient.builder()
                .id(2L)
                .name("Biren Borah")
                .dob(LocalDate.of(1948, 8, 15))
                .gender("Male")
                .preferredLanguage("as")
                .culturalBackground("Assamese")
                .build();

        LifeStory lifeStory = LifeStory.builder()
                .occupation("Teacher")
                .favoriteMusic("Borgeet")
                .build();

        MedicalProfile medicalProfile = MedicalProfile.builder()
                .diagnosis("Early Stage Alzheimer's")
                .clinicalStage("Mild")
                .mmseScore(22)
                .recommendedStartDifficulty(2)
                .build();

        FamilyMember family = FamilyMember.builder()
                .name("Pratima")
                .relation("Spouse")
                .build();

        FamiliarPlace place = FamiliarPlace.builder()
                .name("Silpukhuri")
                .description("Childhood Home")
                .build();

        PatientCard card = PatientCard.builder()
                .id(UUID.randomUUID())
                .patientId(2L)
                .secureToken("token-123")
                .isActive(true)
                .issuedAt(LocalDateTime.now())
                .build();

        PatientDetailResponse response = mapper.toPatientDetailResponse(
                patient,
                Optional.of(lifeStory),
                medicalProfile,
                List.of(family),
                List.of(place),
                Optional.of(card)
        );

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("Biren Borah", response.getName());
        assertEquals("Teacher", response.getLifeStory().getOccupation());
        assertEquals("Borgeet", response.getLifeStory().getFavoriteMusic());
        assertEquals("Early Stage Alzheimer's", response.getMedicalProfile().getDiagnosis());
        assertEquals(22, response.getMedicalProfile().getMmseScore());
        assertEquals(1, response.getFamilyMembers().size());
        assertEquals("Pratima", response.getFamilyMembers().get(0).getName());
        assertEquals(1, response.getFamiliarPlaces().size());
        assertEquals("Silpukhuri", response.getFamiliarPlaces().get(0).getName());
        assertNotNull(response.getCard());
        assertEquals("token-123", response.getCard().getSecureToken());
    }
}
