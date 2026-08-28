package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberResponse {
    private Long id;
    private String name;
    private String relation;
    private String notes;
    private String photoUrl;
}
