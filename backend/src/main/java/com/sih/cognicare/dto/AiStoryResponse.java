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
public class AiStoryResponse {
    private int chapterNumber;
    private String chapterTitle;
    private String chapterNarrative;
    private String sensoryAtmosphere; // e.g. "Smell of mountain pine & fresh cardamom tea"
    private String storyEmoji;
    private List<StoryChoice> choices;
    private boolean isFinale;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoryChoice {
        private String id;
        private String label;
        private String emoji;
        private String nextThemePrompt;
    }
}
