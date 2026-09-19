package com.sih.cognicare.service;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.repository.FamiliarPlaceRepository;
import com.sih.cognicare.repository.FamilyMemberRepository;
import com.sih.cognicare.repository.LifeStoryRepository;
import com.sih.cognicare.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OllamaReminiscenceServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @Mock
    private FamiliarPlaceRepository familiarPlaceRepository;

    @Mock
    private LifeStoryRepository lifeStoryRepository;

    @InjectMocks
    private OllamaReminiscenceService reminiscenceService;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = Patient.builder()
                .id(1L)
                .name("Biren Borah")
                .preferredLanguage("as")
                .culturalBackground("North East India (Assam)")
                .joyTriggers("Morning tea and Namghar prayer")
                .build();
    }

    @Test
    @DisplayName("Should generate fallback chat response when Ollama is offline")
    void testChatFallbackWhenOllamaOffline() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(familiarPlaceRepository.findByPatientId(1L)).thenReturn(Collections.emptyList());
        when(lifeStoryRepository.findByPatientId(1L)).thenReturn(Optional.empty());

        AiChatRequest request = new AiChatRequest();
        request.setPatientId(1L);
        request.setUserMessage("I want to drink some warm tea.");

        AiChatResponse response = reminiscenceService.generateChatResponse(request);

        assertNotNull(response);
        assertNotNull(response.getReplyText());
        assertFalse(response.getReplyText().isBlank());
        assertNotNull(response.getSuggestedQuickReplies());
        assertFalse(response.getSuggestedQuickReplies().isEmpty());
    }

    @Test
    @DisplayName("Should generate fallback clues when Ollama is offline")
    void testCluesFallbackWhenOllamaOffline() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        AiCluesRequest request = new AiCluesRequest();
        request.setPatientId(1L);
        request.setTargetType("PLACE");
        request.setTargetName("Namghar Bell");
        request.setTargetRelationOrSignificance("Spiritual prayer bell");

        AiCluesResponse response = reminiscenceService.generateClues(request);

        assertNotNull(response);
        assertNotNull(response.getGentleClue1());
        assertNotNull(response.getSpecificClue2());
        assertNotNull(response.getDirectClue3());
    }

    @Test
    @DisplayName("Should generate fallback bazaar turn when Ollama is offline")
    void testBazaarFallbackWhenOllamaOffline() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        AiBazaarRequest request = new AiBazaarRequest();
        request.setPatientId(1L);
        request.setCurrentItem("Fresh Assam Tea Leaves");
        request.setUserSpokenMessage("How much does one packet cost?");

        AiBazaarResponse response = reminiscenceService.generateBazaarTurn(request);

        assertNotNull(response);
        assertNotNull(response.getMerchantDialogue());
        assertNotNull(response.getQuickOptions());
    }

    @Test
    @DisplayName("Should generate fallback proverb challenge when Ollama is offline")
    void testProverbFallbackWhenOllamaOffline() {
        AiProverbRequest request = new AiProverbRequest();
        request.setPatientId(1L);
        request.setLanguage("as");
        request.setCategory("WISDOM");

        AiProverbResponse response = reminiscenceService.generateProverbChallenge(request);

        assertNotNull(response);
        assertNotNull(response.getPartialVerseWithBlank());
        assertNotNull(response.getCorrectWord());
        assertNotNull(response.getCandidateOptions());
        assertFalse(response.getCandidateOptions().isEmpty());
    }

    @Test
    @DisplayName("Should generate fallback memoir story when Ollama is offline")
    void testMemoirFallbackWhenOllamaOffline() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        AiMemoirRequest request = new AiMemoirRequest();
        request.setPatientId(1L);
        request.setPhotoPromptTitle("Village harvest celebration");
        request.setUserSpokenNarrative("We used to gather near the river during Magh Bihu.");

        AiMemoirResponse response = reminiscenceService.generateMemoirStory(request);

        assertNotNull(response);
        assertNotNull(response.getMemoirTitle());
        assertNotNull(response.getPoeticNarrative());
    }
}
