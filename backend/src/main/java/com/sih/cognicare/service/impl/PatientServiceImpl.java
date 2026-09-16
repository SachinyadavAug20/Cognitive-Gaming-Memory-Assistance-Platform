package com.sih.cognicare.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.exception.PatientNotFoundException;
import com.sih.cognicare.model.*;
import com.sih.cognicare.repository.*;
import com.sih.cognicare.service.FileStorageService;
import com.sih.cognicare.service.MedicalReportService;
import com.sih.cognicare.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientServiceImpl.class);

    private final PatientRepository patientRepo;
    private final FamilyMemberRepository familyMemberRepo;
    private final FamiliarPlaceRepository familiarPlaceRepo;
    private final LifeStoryRepository lifeStoryRepo;
    private final MedicalProfileRepository medicalProfileRepo;
    private final PatientCardRepository patientCardRepo;
    private final FileStorageService fileStorageService;
    private final MedicalReportService medicalReportService;
    private final ObjectMapper objectMapper;
    private final PatientDtoMapper patientDtoMapper;

    @Override
    @Transactional
    public PatientOnboardResponse onboardPatient(String dataJson, MultipartFile reportFile, List<MultipartFile> photos) {
        try {
            OnboardRequest request = objectMapper.readValue(dataJson, OnboardRequest.class);

            Patient patient = patientDtoMapper.buildPatientEntity(request);
            patientRepo.save(patient);
            log.info("Saved patient: id={}, name={}", patient.getId(), patient.getName());

            persistFamilyMembers(patient, request.getRelatives(), photos);
            persistFamiliarPlaces(patient, request.getLandmarks(), photos);
            persistLifeStory(patient, request.getLifeStory());

            MedicalProfile medicalProfile = patientDtoMapper.buildBaseMedicalProfile(patient);
            if (request.getDiagnostic() != null && reportFile != null && !reportFile.isEmpty()) {
                try {
                    String reportPath = fileStorageService.saveFile(reportFile, patient.getId(), "reports");
                    medicalProfile.setRawReportPath(reportPath);
                } catch (Exception e) {
                    log.warn("Could not persist report file on disk: {}", e.getMessage());
                }
            }
            applyDiagnosticData(medicalProfile, request.getDiagnostic());
            medicalProfileRepo.save(medicalProfile);

            PatientCard card = PatientCard.builder()
                    .patientId(patient.getId())
                    .secureToken(UUID.randomUUID().toString())
                    .isActive(true)
                    .issuedAt(LocalDateTime.now())
                    .build();
            patientCardRepo.save(card);
            log.info("Generated active card for patient id={}: token={}", patient.getId(), card.getSecureToken());

            List<FamilyMember> familyMembers = familyMemberRepo.findByPatientId(patient.getId());
            List<FamiliarPlace> familiarPlaces = familiarPlaceRepo.findByPatientId(patient.getId());

            return PatientOnboardResponse.builder()
                    .patientId(patient.getId())
                    .medicalProfile(patientDtoMapper.toMedicalProfileResponse(medicalProfile))
                    .familyCount(familyMembers.size())
                    .placesCount(familiarPlaces.size())
                    .build();

        } catch (Exception e) {
            log.error("Failed to onboard patient: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to onboard patient: " + e.getMessage(), e);
        }
    }

    @Override
    public List<PatientProfileResponse> getAllPatients() {
        return patientRepo.findAll().stream()
                .map(patientDtoMapper::toPatientProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PatientDetailResponse getPatientDetail(Long patientId) {
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        Optional<LifeStory> optionalLifeStory = lifeStoryRepo.findByPatientId(patientId);
        MedicalProfile medicalProfile = medicalProfileRepo.findByPatientId(patientId).orElse(null);
        List<FamilyMember> familyMembers = familyMemberRepo.findByPatientId(patientId);
        List<FamiliarPlace> familiarPlaces = familiarPlaceRepo.findByPatientId(patientId);
        Optional<PatientCard> optionalActiveCard = patientCardRepo.findTopByPatientIdAndIsActiveTrue(patientId);

        return patientDtoMapper.toPatientDetailResponse(
                patient,
                optionalLifeStory,
                medicalProfile,
                familyMembers,
                familiarPlaces,
                optionalActiveCard
        );
    }

    @Override
    public List<FamilyMemberResponse> getPatientFamilyMembers(Long patientId) {
        if (!patientRepo.existsById(patientId)) {
            throw new PatientNotFoundException(patientId);
        }
        return familyMemberRepo.findByPatientId(patientId).stream()
                .map(patientDtoMapper::toFamilyMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FamiliarPlaceResponse> getPatientFamiliarPlaces(Long patientId) {
        if (!patientRepo.existsById(patientId)) {
            throw new PatientNotFoundException(patientId);
        }
        return familiarPlaceRepo.findByPatientId(patientId).stream()
                .map(patientDtoMapper::toFamiliarPlaceResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalProfileResponse getPatientMedicalProfile(Long patientId) {
        return medicalProfileRepo.findByPatientId(patientId)
                .map(patientDtoMapper::toMedicalProfileResponse)
                .orElse(null);
    }

    @Override
    public MedicalProfileResponse analyzeDiagnosticReportPdf(MultipartFile reportFile) {
        if (reportFile == null || reportFile.isEmpty()) {
            throw new IllegalArgumentException("Report file must not be empty");
        }

        log.info("Demo PDF analysis requested for: {}", reportFile.getOriginalFilename());

        Map<String, MedicalProfileResponse.SubscaleScoreDto> subscaleScores = Map.of(
                "orientation", new MedicalProfileResponse.SubscaleScoreDto(8, 10),
                "registration", new MedicalProfileResponse.SubscaleScoreDto(3, 3),
                "attention_calculation", new MedicalProfileResponse.SubscaleScoreDto(3, 5),
                "recall", new MedicalProfileResponse.SubscaleScoreDto(1, 3),
                "language_visuospatial", new MedicalProfileResponse.SubscaleScoreDto(8, 9)
        );

        Map<String, DomainAssessment> domains = Map.of(
                "memory", new DomainAssessment(true, "Mild", 60, "Delayed recall score 1/3; benefits from associative cues and visual prompts."),
                "attention", new DomainAssessment(false, "Mild", 70, "Serial subtraction hesitation noted; rhythm auditory pacing recommended."),
                "orientation", new DomainAssessment(false, "None", 85, "Temporal orientation preserved; occasional date uncertainty."),
                "language", new DomainAssessment(false, "None", 90, "Fluent mother tongue conversation; naming intact."),
                "visuospatial", new DomainAssessment(false, "None", 80, "Clock drawing intact with minor contour asymmetry."),
                "executive_function", new DomainAssessment(true, "Mild", 65, "Multistep planning slowing; calibrated for assisted navigation.")
        );

        MedicalProfileResponse.GameConfigDto gameConfig = MedicalProfileResponse.GameConfigDto.builder()
                .startLevel(1)
                .memoryGridSize(2)
                .memoryPreviewSeconds(15)
                .memoryShowHints(true)
                .wayfindingRouteLength(2)
                .audioSpeechRate(0.75)
                .build();

        return MedicalProfileResponse.builder()
                .diagnosis("Mild Cognitive Impairment (Amnestic Multi-Domain)")
                .icd10("G31.84")
                .dateOfDiagnosis(LocalDate.now().toString())
                .examiningPhysician("Dr. Wanbha Kharkongor, MD (Neurology)")
                .clinicOrHospital("Gauhati Medical College & Hospital (GMCH)")
                .clinicalStage("MCI")
                .recommendedStartDifficulty(1)
                .llmSummary("Clinical assessment indicates MCI stage cognitive impairment (MMSE 23/30). Preserved IADLs with mild short-term recall deficits. Automated game baseline calibrated for multi-sensory stimulation.")
                .testType("MMSE")
                .mmseScore(23)
                .maxScore(30)
                .mtaScore("Grade 1")
                .fazekasGrade("Grade 1")
                .medications(List.of("Donepezil 5mg (bedtime)", "Citicoline 500mg", "B-Complex"))
                .impairedDomains("[{\"domain\":\"memory\",\"impairment_level\":\"Mild\",\"evidence\":\"Delayed recall score: 1/3.\"},{\"domain\":\"attention\",\"impairment_level\":\"Mild\",\"evidence\":\"Serial subtraction hesitation noted.\"},{\"domain\":\"executive_function\",\"impairment_level\":\"Mild\",\"evidence\":\"Multistep planning slowing.\"}]")
                .primaryDeficits("[{\"domain\":\"memory\",\"impairment_level\":\"Mild\",\"evidence\":\"Delayed recall score: 1/3.\"}]")
                .subscaleScores(subscaleScores)
                .domains(domains)
                .gameConfig(gameConfig)
                .build();
    }

    private void persistFamilyMembers(Patient patient, List<OnboardRequest.RelativeRequest> relatives, List<MultipartFile> photos) {
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
                    try {
                        String photoPath = fileStorageService.saveFile(photo, patient.getId(), "photos");
                        member.setPhotoPath(photoPath);
                    } catch (Exception e) {
                        log.warn("Could not save relative photo: {}", e.getMessage());
                    }
                }
            }
            members.add(member);
        }
        familyMemberRepo.saveAll(members);
        log.info("Saved {} family members for patient id={}", members.size(), patient.getId());
    }

    private void persistFamiliarPlaces(Patient patient, List<OnboardRequest.LandmarkRequest> landmarks, List<MultipartFile> photos) {
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
                    try {
                        String photoPath = fileStorageService.saveFile(photo, patient.getId(), "places");
                        place.setPhotoPath(photoPath);
                    } catch (Exception e) {
                        log.warn("Could not save place photo: {}", e.getMessage());
                    }
                }
            }
            places.add(place);
        }
        familiarPlaceRepo.saveAll(places);
        log.info("Saved {} familiar places for patient id={}", places.size(), patient.getId());
    }

    private void persistLifeStory(Patient patient, OnboardRequest.LifeStoryRequest ls) {
        if (ls == null) return;
        String lifeEventsJson = null;
        if (ls.getLifeEvents() != null && !ls.getLifeEvents().isEmpty()) {
            try {
                lifeEventsJson = objectMapper.writeValueAsString(ls.getLifeEvents());
            } catch (Exception e) {
                log.warn("Could not serialize life events: {}", e.getMessage());
            }
        }
        String hobbies = ls.getInterests() != null && !ls.getInterests().isEmpty()
                ? String.join(", ", ls.getInterests()) : null;

        LifeStory lifeStory = LifeStory.builder()
                .patient(patient)
                .occupation(ls.getOccupation())
                .hobbies(hobbies)
                .favoriteMusic(ls.getFavoriteMusic())
                .lifeEvents(lifeEventsJson)
                .build();
        lifeStoryRepo.save(lifeStory);
        log.info("Saved life story for patient id={}", patient.getId());
    }

    private void applyDiagnosticData(MedicalProfile mp, OnboardRequest.DiagnosticDataRequest diag) {
        if (diag == null) return;

        if (diag.getDiagnosis() != null && !diag.getDiagnosis().isBlank()) {
            mp.setDiagnosis(diag.getDiagnosis());
        }
        if (diag.getIcd10() != null && !diag.getIcd10().isBlank()) {
            mp.setIcd10(diag.getIcd10());
        }
        if (diag.getDateOfDiagnosis() != null && !diag.getDateOfDiagnosis().isBlank()) {
            mp.setDateOfDiagnosis(diag.getDateOfDiagnosis());
        }
        if (diag.getExaminingPhysician() != null && !diag.getExaminingPhysician().isBlank()) {
            mp.setExaminingPhysician(diag.getExaminingPhysician());
        }
        if (diag.getClinicOrHospital() != null && !diag.getClinicOrHospital().isBlank()) {
            mp.setClinicOrHospital(diag.getClinicOrHospital());
        }
        if (diag.getStage() != null && !diag.getStage().isBlank()) {
            mp.setClinicalStage(patientDtoMapper.mapClinicalStage(diag.getStage()));
        }
        if (diag.getRecommendedStartLevel() != null) {
            mp.setRecommendedStartDifficulty(diag.getRecommendedStartLevel());
        }
        if (diag.getPhysicianNotes() != null && !diag.getPhysicianNotes().isBlank()) {
            mp.setLlmSummary(diag.getPhysicianNotes());
        }
        if (diag.getTestType() != null && !diag.getTestType().isBlank()) {
            mp.setTestType(diag.getTestType());
        }
        if (diag.getScore() != null) {
            mp.setMmseScore(diag.getScore());
        }
        if (diag.getMaxScore() != null) {
            mp.setMaxScore(diag.getMaxScore());
        }
        if (diag.getMtaScore() != null && !diag.getMtaScore().isBlank()) {
            mp.setMtaScore(diag.getMtaScore());
        }
        if (diag.getFazekasGrade() != null && !diag.getFazekasGrade().isBlank()) {
            mp.setFazekasGrade(diag.getFazekasGrade());
        }

        if (diag.getMedications() != null) {
            try {
                mp.setMedicationsJson(objectMapper.writeValueAsString(diag.getMedications()));
            } catch (Exception e) {
                log.warn("Could not serialize medications: {}", e.getMessage());
            }
        }

        if (diag.getSubscaleScores() != null) {
            try {
                mp.setSubscaleScoresJson(objectMapper.writeValueAsString(diag.getSubscaleScores()));
            } catch (Exception e) {
                log.warn("Could not serialize subscale scores: {}", e.getMessage());
            }
        }

        if (diag.getDomains() != null) {
            try {
                mp.setClinicalDomainsJson(objectMapper.writeValueAsString(diag.getDomains()));
                PatientDtoMapper.DomainSummaries summaries = patientDtoMapper.summarizeDomains(diag.getDomains());
                mp.setImpairedDomains(summaries.impairedJson());
                mp.setPrimaryDeficits(summaries.primaryJson());
            } catch (Exception e) {
                log.warn("Could not serialize domains: {}", e.getMessage());
            }
        }
    }
}
