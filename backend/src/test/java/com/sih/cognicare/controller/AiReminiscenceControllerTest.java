package com.sih.cognicare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.exception.GlobalExceptionHandler;
import com.sih.cognicare.service.OllamaReminiscenceService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AiReminiscenceControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OllamaReminiscenceService reminiscenceService;

    @InjectMocks
    private AiReminiscenceController reminiscenceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reminiscenceController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/ai/reminiscence/chat - Should return conversational response")
    void testChat() throws Exception {
        AiChatRequest request = AiChatRequest.builder()
                .patientId(1L)
                .personaName("Friend")
                .userMessage("Namaste")
                .build();

        AiChatResponse response = AiChatResponse.builder()
                .replyText("Namaste Ramesh ji! How are you feeling today?")
                .suggestedQuickReplies(List.of("I am doing well", "Tell me about village"))
                .build();

        when(reminiscenceService.generateChatResponse(any(AiChatRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/reminiscence/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.replyText").value("Namaste Ramesh ji! How are you feeling today?"))
                .andExpect(jsonPath("$.suggestedQuickReplies[0]").value("I am doing well"));
    }

    @Test
    @DisplayName("POST /api/v1/ai/reminiscence/clues - Should return progressive memory clues")
    void testGetClues() throws Exception {
        AiCluesRequest request = AiCluesRequest.builder()
                .patientId(1L)
                .targetType("PLACE")
                .targetName("Village Temple")
                .targetRelationOrSignificance("Ancestral place of worship")
                .build();

        AiCluesResponse response = AiCluesResponse.builder()
                .gentleClue1("Listen to the morning brass bells ringing...")
                .specificClue2("The red spire where sweet prasad is shared...")
                .directClue3("The Lord Shiva temple beside the banyan pond.")
                .build();

        when(reminiscenceService.generateClues(any(AiCluesRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/reminiscence/clues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gentleClue1").value("Listen to the morning brass bells ringing..."))
                .andExpect(jsonPath("$.directClue3").value("The Lord Shiva temple beside the banyan pond."));
    }

    @Test
    @DisplayName("POST /api/v1/ai/reminiscence/story-chapter - Should return narrative chapter with choices")
    void testGetStoryChapter() throws Exception {
        AiStoryRequest request = AiStoryRequest.builder()
                .patientId(1L)
                .theme("Morning Walk")
                .currentChapterIndex(1)
                .build();

        AiStoryResponse response = AiStoryResponse.builder()
                .chapterNumber(1)
                .chapterTitle("The Path by the River")
                .chapterNarrative("The morning mist rises gracefully over the mustard fields.")
                .sensoryAtmosphere("Smell of wet earth and marigolds")
                .storyEmoji("🌾")
                .isFinale(false)
                .choices(List.of(
                        AiStoryResponse.StoryChoice.builder()
                                .id("choice-1")
                                .label("Visit the potter's wheel")
                                .emoji("🏺")
                                .build()
                ))
                .build();

        when(reminiscenceService.generateStoryChapter(any(AiStoryRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/reminiscence/story-chapter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chapterNumber").value(1))
                .andExpect(jsonPath("$.chapterTitle").value("The Path by the River"))
                .andExpect(jsonPath("$.choices[0].label").value("Visit the potter's wheel"));
    }

    @Test
    @DisplayName("POST /api/v1/ai/reminiscence/bazaar - Should return interactive bazaar barter turn")
    void testGetBazaarTurn() throws Exception {
        AiBazaarRequest request = AiBazaarRequest.builder()
                .patientId(1L)
                .marketName("Spice Bazaar")
                .currentItem("Cardamom pods")
                .userOfferPrice(10)
                .build();

        AiBazaarResponse response = AiBazaarResponse.builder()
                .merchantDialogue("Wah! Fresh cardamom from the hills. What would you like to trade?")
                .quickOptions(List.of("Offer 10 coins", "Ask for a discount"))
                .build();

        when(reminiscenceService.generateBazaarTurn(any(AiBazaarRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/reminiscence/bazaar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.merchantDialogue").value("Wah! Fresh cardamom from the hills. What would you like to trade?"))
                .andExpect(jsonPath("$.quickOptions[0]").value("Offer 10 coins"));
    }

    @Test
    @DisplayName("POST /api/v1/ai/reminiscence/proverb - Should return regional proverb puzzle")
    void testGetProverbChallenge() throws Exception {
        AiProverbRequest request = AiProverbRequest.builder()
                .patientId(1L)
                .language("hi")
                .category("WISDOM")
                .build();

        AiProverbResponse response = AiProverbResponse.builder()
                .partialVerseWithBlank("Nach na jaane ___ tedha")
                .correctWord("aangan")
                .candidateOptions(List.of("aangan", "bazaar", "ghar", "rasta"))
                .build();

        when(reminiscenceService.generateProverbChallenge(any(AiProverbRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/reminiscence/proverb")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctWord").value("aangan"))
                .andExpect(jsonPath("$.candidateOptions[0]").value("aangan"));
    }

    @Test
    @DisplayName("POST /api/v1/ai/reminiscence/memoir-scribe - Should scribe narrative memoir")
    void testGetMemoirStory() throws Exception {
        AiMemoirRequest request = AiMemoirRequest.builder()
                .patientId(1L)
                .photoPromptTitle("Baisakhi Festival")
                .userSpokenNarrative("Harvest festival memories with childhood friends")
                .build();

        AiMemoirResponse response = AiMemoirResponse.builder()
                .memoirTitle("Golden Fields of Baisakhi")
                .poeticNarrative("When the golden stalks bowed to the gentle winds, laughter filled the courtyard...")
                .build();

        when(reminiscenceService.generateMemoirStory(any(AiMemoirRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/reminiscence/memoir-scribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.memoirTitle").value("Golden Fields of Baisakhi"))
                .andExpect(jsonPath("$.poeticNarrative").value("When the golden stalks bowed to the gentle winds, laughter filled the courtyard..."));
    }
}
