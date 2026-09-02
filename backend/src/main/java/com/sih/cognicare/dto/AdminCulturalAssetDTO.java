package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCulturalAssetDTO {
    private String id;
    private String languageCode;  // "as", "hi", "mni", "kha", "lus", "brx", "grt", "ne", "mr", "bn", "en"
    private String languageName;  // "Assamese", "Khasi", "Mizo", "Manipuri"
    private String category;      // "PROVERB", "FOLK_SONG", "FESTIVAL_MEMORY", "LOCAL_MARKET"
    private String textPrompt;
    private String nativeScript;
    private String missingWordAnswer;
    private String culturalContext;
}
