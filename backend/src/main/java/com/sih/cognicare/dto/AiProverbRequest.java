package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiProverbRequest {
    private Long patientId;
    private String language;
    private String category; // e.g. "WISDOM", "BIHU_SONG", "FAMILY", "NATURE"
}
