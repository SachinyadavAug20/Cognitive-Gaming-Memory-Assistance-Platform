package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamiliarPlaceResponse {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String emoji;
    private String photoUrl;
}
