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
public class AiCluesResponse {
    private String gentleClue1;
    private String specificClue2;
    private String directClue3;
    private String encouragingEncouragement;
    private List<String> candidateOptions;
}
