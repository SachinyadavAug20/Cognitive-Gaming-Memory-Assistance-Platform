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
public class AiChatResponse {
    private String replyText;
    private String spokenAudioText;
    private String emotionTone; // "warm", "loving", "encouraging"
    private List<String> suggestedQuickReplies;
    private String highlightedMemoryNote;
    private String relatedPhotoUrl;
}
