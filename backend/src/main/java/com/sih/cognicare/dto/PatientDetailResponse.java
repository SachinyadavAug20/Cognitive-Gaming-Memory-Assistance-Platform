package com.sih.cognicare.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatientDetailResponse {
    private Long id;
    private String name;
    private LocalDate dob;
    private String gender;
    private String phone;
    private String relationship;
    private Long caregiverId;
    private String preferredLanguage;
    private String culturalBackground;
    private String joyTriggers;
    private LocalDateTime createdAt;

    private LifeStoryDto lifeStory;
    private MedicalProfileResponse medicalProfile;
    private List<FamilyMemberResponse> familyMembers;
    private List<FamiliarPlaceResponse> familiarPlaces;
    private GenerateCardResponse card;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LifeStoryDto {
        private String occupation;
        private String favoriteMusic;
        private List<String> hobbies;
        private List<LifeEventDto> lifeEvents;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LifeEventDto {
        private String event;
        private String year;
        private String photoUrl;
    }
}
