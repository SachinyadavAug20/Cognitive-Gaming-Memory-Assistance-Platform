package com.sih.cognicare.dto;

import lombok.Data;

import java.util.List;

@Data
public class OnboardRequest {

    private PersonalInfo personal;
    private List<RelativeRequest> relatives;
    private LifeStoryRequest lifeStory;
    private List<LandmarkRequest> landmarks;
    private Long caregiverId;

    @Data
    public static class PersonalInfo {
        private String fullName;
        private String dateOfBirth;
        private String gender;
        private String phone;
        private String relationship;
    }

    @Data
    public static class RelativeRequest {
        private String name;
        private String relationship;
        private String notes;
        private Integer photoIndex;
    }

    @Data
    public static class LifeStoryRequest {
        private String occupation;
        private String favoriteMusic;
        private List<String> interests;
        private List<LifeEventRequest> lifeEvents;
        private String culturalBackground;
        private String preferredLanguage;
        private String joyNote;
    }

    @Data
    public static class LifeEventRequest {
        private String event;
        private String year;
    }

    @Data
    public static class LandmarkRequest {
        private String name;
        private String description;
        private String emoji;
        private Integer photoIndex;
    }
}
