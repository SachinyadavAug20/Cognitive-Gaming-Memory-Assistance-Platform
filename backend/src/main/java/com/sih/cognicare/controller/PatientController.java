package com.sih.cognicare.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.*;
import com.sih.cognicare.repository.*;
import com.sih.cognicare.service.FileStorageService;
import com.sih.cognicare.service.MedicalReportService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PatientController {

    private static final Logger log = LoggerFactory.getLogger(PatientController.class);

    private final PatientRepository patientRepo;
    private final FamilyMemberRepository familyMemberRepo;
    private final FamiliarPlaceRepository familiarPlaceRepo;
    private final LifeStoryRepository lifeStoryRepo;
    private final MedicalProfileRepository medicalProfileRepo;
    private final FileStorageService fileStorageService;
    private final MedicalReportService medicalReportService;
    private final ObjectMapper objectMapper;

    @PostMapping("/patients/onboard")
    @Transactional
    public ResponseEntity<PatientOnboardResponse> onboardPatient(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "reportFile", required = false) MultipartFile reportFile,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {

        try {
            OnboardRequest request = objectMapper.readValue(dataJson, OnboardRequest.class);

            Patient patient = buildPatient(request);
            patientRepo.save(patient);
            log.info("Saved patient: id={}, name={}", patient.getId(), patient.getName());

            saveFamilyMembers(patient, request.getRelatives(), photos);
            saveFamiliarPlaces(patient, request.getLandmarks(), photos);
            saveLifeStory(patient, request.getLifeStory());

            MedicalProfile medicalProfile = buildMedicalProfile(patient);
            if (request.getDiagnostic() != null && reportFile != null && !reportFile.isEmpty()) {
                String reportPath = fileStorageService.saveFile(reportFile, patient.getId(), "reports");
                medicalProfile.setRawReportPath(reportPath);
            }
            applyDiagnosticData(medicalProfile, request.getDiagnostic());
            medicalProfileRepo.save(medicalProfile);

            List<FamilyMember> familyMembers = familyMemberRepo.findByPatientId(patient.getId());
            List<FamiliarPlace> familiarPlaces = familiarPlaceRepo.findByPatientId(patient.getId());

            PatientOnboardResponse response = PatientOnboardResponse.builder()
                    .patientId(patient.getId())
                    .medicalProfile(toMedicalProfileResponse(medicalProfile))
                    .familyCount(familyMembers.size())
                    .placesCount(familiarPlaces.size())
                    .build();

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("Failed to parse onboard data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/patients/{id}/family")
    public ResponseEntity<List<FamilyMemberResponse>> getFamilyMembers(@PathVariable Long id) {
        List<FamilyMember> members = familyMemberRepo.findByPatientId(id);
        List<FamilyMemberResponse> response = members.stream()
                .map(this::toFamilyMemberResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patients/{id}/places")
    public ResponseEntity<List<FamiliarPlaceResponse>> getFamiliarPlaces(@PathVariable Long id) {
        List<FamiliarPlace> places = familiarPlaceRepo.findByPatientId(id);
        List<FamiliarPlaceResponse> response = places.stream()
                .map(this::toFamiliarPlaceResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patients/{id}/medical-profile")
    public ResponseEntity<MedicalProfileResponse> getMedicalProfile(@PathVariable Long id) {
        return medicalProfileRepo.findByPatientId(id)
                .map(mp -> ResponseEntity.ok(toMedicalProfileResponse(mp)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/patients/analyze-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicalProfileResponse> analyzePdfOnly(
            @RequestPart("reportFile") MultipartFile reportFile) {
        if (reportFile == null || reportFile.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        File tempFile = null;
        try {
            tempFile = File.createTempFile("preview-report-", ".pdf");
            reportFile.transferTo(tempFile);

            MedicalProfile profile = new MedicalProfile();
            medicalReportService.analyzeReport(tempFile, profile);

            MedicalProfileResponse response = toMedicalProfileResponse(profile);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Failed to analyze PDF preview: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    @GetMapping("/uploads/{path:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String path) {
        Resource resource = fileStorageService.loadFile(path);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    // --- Private helpers ---

    private Patient buildPatient(OnboardRequest request) {
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

    private void saveFamilyMembers(Patient patient, List<OnboardRequest.RelativeRequest> relatives, List<MultipartFile> photos) {
        if (relatives == null || relatives.isEmpty()) return;
        List<FamilyMember> members = new ArrayList<>();

        for (OnboardRequest.RelativeRequest rel : relatives) {
            FamilyMember member = FamilyMember.builder()
                    .patient(patient)
                    .name(rel.getName())
                    .relation(rel.getRelationship())
                    .notes(rel.getNotes())
                    .build();

            if (rel.getPhotoIndex() != null && photos != null && rel.getPhotoIndex() < photos.size()) {
                MultipartFile photo = photos.get(rel.getPhotoIndex());
                if (photo != null && !photo.isEmpty()) {
                    String photoPath = fileStorageService.saveFile(photo, patient.getId(), "photos");
                    member.setPhotoPath(photoPath);
                }
            }
            members.add(member);
        }
        patient.setFamilyMembers(members);
        familyMemberRepo.saveAll(members);
    }

    private void saveFamiliarPlaces(Patient patient, List<OnboardRequest.LandmarkRequest> landmarks, List<MultipartFile> photos) {
        if (landmarks == null || landmarks.isEmpty()) return;
        List<FamiliarPlace> places = new ArrayList<>();

        for (OnboardRequest.LandmarkRequest lm : landmarks) {
            FamiliarPlace place = FamiliarPlace.builder()
                    .patient(patient)
                    .name(lm.getName())
                    .category(lm.getEmoji())
                    .description(lm.getDescription())
                    .emoji(lm.getEmoji())
                    .build();

            if (lm.getPhotoIndex() != null && photos != null && lm.getPhotoIndex() < photos.size()) {
                MultipartFile photo = photos.get(lm.getPhotoIndex());
                if (photo != null && !photo.isEmpty()) {
                    String photoPath = fileStorageService.saveFile(photo, patient.getId(), "photos");
                    place.setPhotoPath(photoPath);
                }
            }
            places.add(place);
        }
        patient.setFamiliarPlaces(places);
        familiarPlaceRepo.saveAll(places);
    }

    private void saveLifeStory(Patient patient, OnboardRequest.LifeStoryRequest ls) {
        if (ls == null) return;

        String hobbies = ls.getInterests() != null ? String.join(",", ls.getInterests()) : null;

        String lifeEventsJson = "[]";
        if (ls.getLifeEvents() != null && !ls.getLifeEvents().isEmpty()) {
            try {
                lifeEventsJson = objectMapper.writeValueAsString(ls.getLifeEvents());
            } catch (Exception e) {
                log.warn("Could not serialize life events: {}", e.getMessage());
            }
        }

        LifeStory story = LifeStory.builder()
                .patient(patient)
                .occupation(ls.getOccupation())
                .favoriteMusic(ls.getFavoriteMusic())
                .hobbies(hobbies)
                .lifeEvents(lifeEventsJson)
                .build();

        lifeStoryRepo.save(story);
    }

    private MedicalProfile buildMedicalProfile(Patient patient) {
        return MedicalProfile.builder()
                .patient(patient)
                .build();
    }

    private void applyDiagnosticData(MedicalProfile profile, OnboardRequest.DiagnosticDataRequest data) {
        if (data == null) {
            medicalReportService.applyDefaultProfile(profile, "No report analyzed — baseline difficulty initialized");
            return;
        }

        profile.setDiagnosis(data.getDiagnosis());
        profile.setIcd10(data.getIcd10());
        profile.setDateOfDiagnosis(data.getDateOfDiagnosis() != null ? data.getDateOfDiagnosis() : "");
        profile.setExaminingPhysician(data.getExaminingPhysician());
        profile.setClinicOrHospital(data.getClinicOrHospital());
        profile.setTestType(data.getTestType() != null ? data.getTestType() : "Unknown");
        profile.setMmseScore(data.getScore());
        Integer max = data.getMaxScore();
        if (max == null && data.getScore() != null && "MoCA".equalsIgnoreCase(data.getTestType())) {
            max = 30;
        } else if (max == null && data.getScore() != null) {
            max = 30;
        }
        profile.setMaxScore(max);
        profile.setClinicalStage(mapStage(data.getStage()));
        profile.setRecommendedStartDifficulty(data.getRecommendedStartLevel() != null
                ? Math.max(1, Math.min(3, data.getRecommendedStartLevel())) : 1);
        profile.setMtaScore(data.getMtaScore());
        profile.setFazekasGrade(data.getFazekasGrade());
        profile.setLlmSummary(data.getPhysicianNotes());

        try {
            profile.setMedicationsJson(data.getMedications() != null
                    ? objectMapper.writeValueAsString(data.getMedications()) : "[]");
        } catch (Exception e) {
            log.warn("Could not serialize medications: {}", e.getMessage());
        }

        try {
            profile.setSubscaleScoresJson(data.getSubscaleScores() != null
                    ? objectMapper.writeValueAsString(data.getSubscaleScores()) : "{}");
        } catch (Exception e) {
            log.warn("Could not serialize subscale scores: {}", e.getMessage());
        }

        try {
            if (data.getDomains() != null) {
                profile.setClinicalDomainsJson(objectMapper.writeValueAsString(data.getDomains()));
            } else {
                profile.setClinicalDomainsJson("{}");
            }
        } catch (Exception e) {
            log.warn("Could not serialize clinical domains: {}", e.getMessage());
        }

        DomainSummaries summaries = deriveSummaries(data.getDomains());
        profile.setImpairedDomains(summaries.impairedJson());
        profile.setPrimaryDeficits(summaries.primaryJson());
    }

    private record DomainSummaries(String impairedJson, String primaryJson) {}

    private DomainSummaries deriveSummaries(Map<String, DomainAssessment> domains) {
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

    private String mapStage(String stage) {
        if (stage == null) return "MCI";
        return switch (stage.toLowerCase()) {
            case "mild cognitive impairment", "mci" -> "MCI";
            case "early dementia" -> "Early Dementia";
            case "moderate dementia", "moderate" -> "Moderate";
            case "severe dementia", "severe" -> "Severe";
            default -> "MCI";
        };
    }

    private MedicalProfileResponse toMedicalProfileResponse(MedicalProfile mp) {
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

    /**
     * Builds the calibrated game starting parameters from the patient's recommended
     * start difficulty (derived from the clinical stage). Level base:
     *   L3 (MCI) : 4x4 grid / 5s / no hints / 4 landmarks / standard speech
     *   L2 (Early): 3x3 grid / 10s / toggle hints / 3 landmarks / 0.85x
     *   L1 (Mod/Sev): 2x2 grid / 15-20s / guided hints / 2 landmarks / 0.75x slow
     */
    private MedicalProfileResponse.GameConfigDto buildGameConfig(MedicalProfile mp) {
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

    private FamilyMemberResponse toFamilyMemberResponse(FamilyMember member) {
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

    private FamiliarPlaceResponse toFamiliarPlaceResponse(FamiliarPlace place) {
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
}
