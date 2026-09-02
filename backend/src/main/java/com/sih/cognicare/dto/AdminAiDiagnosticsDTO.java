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
public class AdminAiDiagnosticsDTO {
    private String status;           // "UP" or "DOWN"
    private String host;             // "http://localhost:11434"
    private long latencyMs;
    private List<String> availableModels;
    private String defaultModel;     // "llama3.2:3b"
    private String clinicalPersona;  // "Loving Grandchild & ASHA Scribe"
}
