package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAiTuningDTO {
    private int baselineReactionLatencyMs;   // Default 850ms
    private int hesitationThreshold;         // Default 2 hesitations before scaffolding
    private boolean errorlessScaffolding;     // Prevents frustration by auto-guiding
    private boolean sundowningProtectionMode; // Triggers relaxing music/rhythms after 4 PM
    private String primaryModel;              // "llama3.2:3b" or "qwen2.5:1.5b"
    private double speechRate;                // 0.82 (elderly pacing)
    private String fallbackMode;              // "RULE_BASED_CLINICAL"
}
