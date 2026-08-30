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
public class AiProverbResponse {
    private String id;
    private String category;
    private String partialVerseWithBlank;
    private String correctWord;
    private List<String> candidateOptions;
    private String fullProverb;
    private String explanationAndWisdom;
    private String regionOrigin;
}
