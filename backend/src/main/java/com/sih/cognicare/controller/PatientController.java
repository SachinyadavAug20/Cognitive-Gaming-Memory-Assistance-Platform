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
            if (reportFile != null && !reportFile.isEmpty()) {
                String reportPath = fileStorageService.saveFile(reportFile, patient.getId(), "reports");
                medicalProfile.setRawReportPath(reportPath);
                File tempFile = File.createTempFile("report-", ".pdf");
                reportFile.transferTo(tempFile);
                medicalReportService.analyzeReport(tempFile, medicalProfile);
                tempFile.delete();
            } else {
                medicalReportService.applyDefaultProfile(medicalProfile, "No report uploaded — baseline difficulty initialized");
            }
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
        if (relatives == null) return;
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

            patient.getFamilyMembers().add(member);
        }
    }

    private void saveFamiliarPlaces(Patient patient, List<OnboardRequest.LandmarkRequest> landmarks, List<MultipartFile> photos) {
        if (landmarks == null) return;
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

            patient.getFamiliarPlaces().add(place);
        }
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

        return MedicalProfileResponse.builder()
                .diagnosis(mp.getDiagnosis())
                .dateOfDiagnosis(mp.getDateOfDiagnosis())
                .clinicalStage(mp.getClinicalStage())
                .recommendedStartDifficulty(mp.getRecommendedStartDifficulty())
                .llmSummary(mp.getLlmSummary())
                .testType(mp.getTestType())
                .mmseScore(mp.getMmseScore())
                .maxScore(mp.getMaxScore())
                .impairedDomains(mp.getImpairedDomains())
                .medications(medications)
                .domains(domains)
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
