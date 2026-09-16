package com.sih.cognicare.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PatientDtoMapper {

    private static final Logger log = LoggerFactory.getLogger(PatientDtoMapper.class);
    private final ObjectMapper objectMapper;

    public record DomainSummaries(String impairedJson, String primaryJson) {}

    public Patient buildPatientEntity(OnboardRequest request) {
        OnboardRequest.PersonalInfo personal = request.getPersonal();
        Patient patient = new Patient();
        patient.setName(personal.getFullName());
        if (personal.getDateOfBirth() != null && !personal.getDateOfBirth().isEmpty()) {
            try {
                patient.setDob(LocalDate.parse(personal.getDateOfBirth()));
            } catch (Exception e) {
                log.warn("Could not parse DOB: {}", personal.getDateOfBirth());
            }
        }
        patient.setGender(personal.getGender());
        patient.setPhone(personal.getPhone());
        patient.setRelationship(personal.getRelationship());
        patient.setCaregiverId(request.getCaregiverId());

        OnboardRequest.LifeStoryRequest ls = request.getLifeStory();
        if (ls != null) {
            patient.setPreferredLanguage(ls.getPreferredLanguage());
            patient.setCulturalBackground(ls.getCulturalBackground());
            patient.setJoyTriggers(ls.getJoyNote());
        }

        patient.setFamilyMembers(new ArrayList<>());
        patient.setFamiliarPlaces(new ArrayList<>());
        return patient;
    }

    public MedicalProfile buildBaseMedicalProfile(Patient patient) {
        return MedicalProfile.builder()
                .patient(patient)
                .diagnosis("Pending Diagnosis")
                .clinicalStage("MCI")
                .recommendedStartDifficulty(1)
                .build();
    }

    public PatientProfileResponse toPatientProfileResponse(Patient patient) {
        return PatientProfileResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .languagePreference(patient.getPreferredLanguage())
                .dob(patient.getDob())
                .build();
    }

    public PatientDetailResponse toPatientDetailResponse(
            Patient patient,
            Optional<LifeStory> optionalLifeStory,
            MedicalProfile medicalProfile,
            List<FamilyMember> familyMembers,
            List<FamiliarPlace> familiarPlaces,
            Optional<PatientCard> optionalActiveCard) {

        Long id = patient.getId();
        PatientDetailResponse.LifeStoryDto lifeStoryDto = null;

        if (optionalLifeStory.isPresent()) {
            LifeStory ls = optionalLifeStory.get();
            List<String> hobbies = ls.getHobbies() != null && !ls.getHobbies().isBlank()
                    ? Arrays.stream(ls.getHobbies().split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toList())
                    : List.of();

            List<PatientDetailResponse.LifeEventDto> lifeEvents = List.of();
            if (ls.getLifeEvents() != null && !ls.getLifeEvents().isBlank()) {
                try {
                    lifeEvents = objectMapper.readValue(ls.getLifeEvents(),
                            new TypeReference<List<PatientDetailResponse.LifeEventDto>>() {});
                } catch (Exception e) {
                    log.warn("Could not deserialize life events for patient {}: {}", id, e.getMessage());
                }
            }

            lifeStoryDto = PatientDetailResponse.LifeStoryDto.builder()
                    .occupation(ls.getOccupation())
                    .favoriteMusic(ls.getFavoriteMusic())
                    .hobbies(hobbies)
                    .lifeEvents(lifeEvents)
                    .build();
        }

        MedicalProfileResponse medResponse = medicalProfile != null
                ? toMedicalProfileResponse(medicalProfile)
                : null;

        List<FamilyMemberResponse> family = familyMembers.stream()
                .map(this::toFamilyMemberResponse)
                .collect(Collectors.toList());

        List<FamiliarPlaceResponse> places = familiarPlaces.stream()
                .map(this::toFamiliarPlaceResponse)
                .collect(Collectors.toList());

        GenerateCardResponse cardResponse = optionalActiveCard
                .map(card -> GenerateCardResponse.builder()
                        .secureToken(card.getSecureToken())
                        .patientId(patient.getId())
                        .patientName(patient.getName())
                        .issuedAt(card.getIssuedAt())
                        .isActive(card.isActive())
                        .build())
                .orElse(null);

        return PatientDetailResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .dob(patient.getDob())
                .gender(patient.getGender())
                .phone(patient.getPhone())
                .relationship(patient.getRelationship())
                .caregiverId(patient.getCaregiverId())
                .preferredLanguage(patient.getPreferredLanguage())
                .culturalBackground(patient.getCulturalBackground())
                .joyTriggers(patient.getJoyTriggers())
                .createdAt(patient.getCreatedAt())
                .lifeStory(lifeStoryDto)
                .medicalProfile(medResponse)
                .familyMembers(family)
                .familiarPlaces(places)
                .card(cardResponse)
                .build();
    }

    public MedicalProfileResponse toMedicalProfileResponse(MedicalProfile mp) {
        List<String> medications = List.of();
        if (mp.getMedicationsJson() != null && !mp.getMedicationsJson().isBlank()) {
            try {
                medications = objectMapper.readValue(mp.getMedicationsJson(),
                        new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.warn("Could not deserialize medications: {}", e.getMessage());
            }
        }

        Map<String, DomainAssessment> domains = Map.of();
        if (mp.getClinicalDomainsJson() != null && !mp.getClinicalDomainsJson().isBlank()) {
            try {
                domains = objectMapper.readValue(mp.getClinicalDomainsJson(),
                        new TypeReference<Map<String, DomainAssessment>>() {});
            } catch (Exception e) {
                log.warn("Could not deserialize clinical domains: {}", e.getMessage());
            }
        }

        Map<String, MedicalProfileResponse.SubscaleScoreDto> subscaleScores = Map.of();
        if (mp.getSubscaleScoresJson() != null && !mp.getSubscaleScoresJson().isBlank()) {
            try {
                subscaleScores = objectMapper.readValue(mp.getSubscaleScoresJson(),
                        new TypeReference<Map<String, MedicalProfileResponse.SubscaleScoreDto>>() {});
            } catch (Exception e) {
                log.warn("Could not deserialize subscale scores: {}", e.getMessage());
            }
        }

        return MedicalProfileResponse.builder()
                .diagnosis(mp.getDiagnosis())
                .icd10(mp.getIcd10())
                .dateOfDiagnosis(mp.getDateOfDiagnosis() != null ? mp.getDateOfDiagnosis() : "")
                .examiningPhysician(mp.getExaminingPhysician())
                .clinicOrHospital(mp.getClinicOrHospital())
                .clinicalStage(mp.getClinicalStage() != null ? mp.getClinicalStage() : "MCI")
                .recommendedStartDifficulty(mp.getRecommendedStartDifficulty() != null ? mp.getRecommendedStartDifficulty() : 1)
                .llmSummary(mp.getLlmSummary())
                .testType(mp.getTestType() != null ? mp.getTestType() : "Unknown")
                .mmseScore(mp.getMmseScore())
                .maxScore(mp.getMaxScore() != null ? mp.getMaxScore() : (mp.getMmseScore() != null ? 30 : null))
                .mtaScore(mp.getMtaScore())
                .fazekasGrade(mp.getFazekasGrade())
                .impairedDomains(mp.getImpairedDomains() != null ? mp.getImpairedDomains() : "[]")
                .primaryDeficits(mp.getPrimaryDeficits() != null ? mp.getPrimaryDeficits() : "[]")
                .medications(medications)
                .subscaleScores(subscaleScores)
                .domains(domains)
                .gameConfig(buildGameConfig(mp))
                .build();
    }

    public MedicalProfileResponse.GameConfigDto buildGameConfig(MedicalProfile mp) {
        int level = mp.getRecommendedStartDifficulty() != null
                ? Math.max(1, Math.min(3, mp.getRecommendedStartDifficulty())) : 1;
        boolean highAssist = "Severe".equalsIgnoreCase(mp.getClinicalStage());

        return MedicalProfileResponse.GameConfigDto.builder()
                .startLevel(level)
                .memoryGridSize(level == 3 ? 4 : level == 2 ? 3 : 2)
                .memoryPreviewSeconds(level == 3 ? 5 : level == 2 ? 10 : (highAssist ? 20 : 15))
                .memoryShowHints(level == 1)
                .wayfindingRouteLength(level == 3 ? 4 : level == 2 ? 3 : 2)
                .audioSpeechRate(level == 3 ? 1.0 : level == 2 ? 0.85 : 0.75)
                .build();
    }

    public FamilyMemberResponse toFamilyMemberResponse(FamilyMember member) {
        String photoUrl = member.getPhotoPath() != null
                ? "/uploads/" + member.getPhotoPath()
                : null;
        return FamilyMemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .relation(member.getRelation())
                .notes(member.getNotes())
                .photoUrl(photoUrl)
                .build();
    }

    public FamiliarPlaceResponse toFamiliarPlaceResponse(FamiliarPlace place) {
        String photoUrl = place.getPhotoPath() != null
                ? "/uploads/" + place.getPhotoPath()
                : null;
        return FamiliarPlaceResponse.builder()
                .id(place.getId())
                .name(place.getName())
                .category(place.getCategory())
                .description(place.getDescription())
                .emoji(place.getEmoji())
                .photoUrl(photoUrl)
                .build();
    }

    public DomainSummaries summarizeDomains(Map<String, DomainAssessment> domains) {
        if (domains == null || domains.isEmpty()) {
            return new DomainSummaries("[]", "[]");
        }
        List<Map<String, Object>> impaired = new ArrayList<>();
        List<Map<String, Object>> primary = new ArrayList<>();

        for (Map.Entry<String, DomainAssessment> entry : domains.entrySet()) {
            DomainAssessment d = entry.getValue();
            if (d == null) continue;
            boolean needsHelp = d.isNeedsHelp();
            String level = d.getImpairmentLevel() != null ? d.getImpairmentLevel() : "None";
            if ("None".equalsIgnoreCase(level)) {
                level = needsHelp ? "Mild" : "None";
            }
            if (!needsHelp && "None".equalsIgnoreCase(level)) continue;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("domain", entry.getKey());
            item.put("impairment_level", level);
            if (d.getEvidence() != null && !d.getEvidence().isBlank()) {
                item.put("evidence", d.getEvidence());
            }
            if (d.getScorePct() > 0) {
                item.put("score_pct", d.getScorePct());
            }
            impaired.add(item);
            if (!"None".equalsIgnoreCase(level)) {
                primary.add(item);
            }
        }

        primary.sort(Comparator.comparingInt((Map<String, Object> m) -> {
            String lv = m.get("impairment_level").toString().toLowerCase();
            return switch (lv) {
                case "severe" -> 0;
                case "moderate" -> 1;
                case "mild" -> 2;
                default -> 3;
            };
        }));
        List<Map<String, Object>> topPrimaries = primary.size() > 5 ? primary.subList(0, 5) : primary;

        try {
            return new DomainSummaries(objectMapper.writeValueAsString(impaired),
                    objectMapper.writeValueAsString(topPrimaries));
        } catch (Exception e) {
            log.warn("Could not serialize domain summaries: {}", e.getMessage());
            return new DomainSummaries("[]", "[]");
        }
    }

    public String mapClinicalStage(String stage) {
        if (stage == null) return "MCI";
        return switch (stage.toLowerCase()) {
            case "mild cognitive impairment", "mci" -> "MCI";
            case "early dementia" -> "Early Dementia";
            case "moderate dementia", "moderate" -> "Moderate";
            case "severe dementia", "severe" -> "Severe";
            default -> "MCI";
        };
    }
}
