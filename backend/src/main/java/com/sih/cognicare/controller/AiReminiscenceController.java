package com.sih.cognicare.controller;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.service.OllamaReminiscenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai/reminiscence")
@CrossOrigin(origins = "*")
public class AiReminiscenceController {

    private final OllamaReminiscenceService reminiscenceService;

    public AiReminiscenceController(OllamaReminiscenceService reminiscenceService) {
        this.reminiscenceService = reminiscenceService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        AiChatResponse response = reminiscenceService.generateChatResponse(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/clues")
    public ResponseEntity<AiCluesResponse> getClues(@RequestBody AiCluesRequest request) {
        AiCluesResponse response = reminiscenceService.generateClues(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/story-chapter")
    public ResponseEntity<AiStoryResponse> getStoryChapter(@RequestBody AiStoryRequest request) {
        AiStoryResponse response = reminiscenceService.generateStoryChapter(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bazaar")
    public ResponseEntity<AiBazaarResponse> getBazaarTurn(@RequestBody AiBazaarRequest request) {
        AiBazaarResponse response = reminiscenceService.generateBazaarTurn(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/proverb")
    public ResponseEntity<AiProverbResponse> getProverbChallenge(@RequestBody AiProverbRequest request) {
        AiProverbResponse response = reminiscenceService.generateProverbChallenge(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/memoir-scribe")
    public ResponseEntity<AiMemoirResponse> getMemoirStory(@RequestBody AiMemoirRequest request) {
        AiMemoirResponse response = reminiscenceService.generateMemoirStory(request);
        return ResponseEntity.ok(response);
    }
}
