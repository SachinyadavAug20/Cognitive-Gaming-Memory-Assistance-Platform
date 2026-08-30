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
public class AiStoryRequest {
    private Long patientId;
    private String theme; // e.g. "Tea Garden Morning", "Brahmaputra Ferry", "Shillong Pine Walk"
    private int currentChapterIndex;
    private String previousChoiceMade;
    private List<String> previousChapterSummaries;
}
