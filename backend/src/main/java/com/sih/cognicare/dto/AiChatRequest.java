package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {
    private Long patientId;
    private String userMessage;
    private String personaName; // e.g. "Rohan (Grandson)", "Friend"
    private List<ChatMessage> conversationHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String role; // "assistant" or "user"
        private String text;
    }
}
