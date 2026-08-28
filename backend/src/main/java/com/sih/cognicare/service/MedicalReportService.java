package com.sih.cognicare.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.DomainAssessment;
import com.sih.cognicare.dto.MedicalProfileResponse;
import com.sih.cognicare.model.MedicalProfile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class MedicalReportService {

    private static final Logger log = LoggerFactory.getLogger(MedicalReportService.class);
    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String MODEL = "qwen2.5:1.5b";
    private static final int MIN_TEXT_LENGTH = 50;

    private final ObjectMapper objectMapper;

    public MedicalReportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public MedicalProfile analyzeReport(File pdfFile, MedicalProfile profile) {
        String extractedText;
        try {
            extractedText = extractTextFromPdf(pdfFile);
        } catch (IOException e) {
            log.error("Failed to extract text from PDF: {}", e.getMessage());
            return applyDefaultProfile(profile, "Failed to read PDF — baseline difficulty initialized");
        }

        if (extractedText == null || extractedText.trim().length() < MIN_TEXT_LENGTH) {
            log.warn("Extracted text too short ({} chars), likely scanned PDF",
                    extractedText == null ? 0 : extractedText.length());
            return applyDefaultProfile(profile, "Scanned document detected — baseline difficulty initialized");
        }

        try {
            String ollamaResponse = callOllama(extractedText);
            return parseAndApplyResponse(ollamaResponse, profile);
        } catch (Exception e) {
            log.error("Ollama analysis failed: {}", e.getMessage());
            return applyDefaultProfile(profile, "Ollama unavailable — baseline difficulty initialized");
        }
    }

    private String extractTextFromPdf(File file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String callOllama(String pdfText) throws IOException {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        RestTemplate restTemplate = new RestTemplate(factory);

        String truncated = pdfText.length() > 8000 ? pdfText.substring(0, 8000) : pdfText;

        String prompt = """
                You are a senior clinical neuropsychologist. Thoroughly analyze the medical assessment report text below and extract structured diagnostic metrics, clinical subscale scores, medications, biomarkers, and a 17-domain quantified deficit breakdown into STRICT JSON.

                Text:
                \"\"\"
                %s
                \"\"\"

                Return ONLY valid JSON matching this exact structure:
                {
                  "diagnosis": "string (e.g., Major Neurocognitive Disorder due to probable Alzheimer's Disease)",
                  "icd10": "string or null (e.g., G30.9 / F02.80)",
                  "dateOfDiagnosis": "string (e.g., 08/20/2026)",
                  "examiningPhysician": "string (e.g., Dr. Sarah Jenkins, MD)",
                  "clinicOrHospital": "string (e.g., St. Jude Medical Center)",
                  "testType": "MMSE" | "MoCA" | "General Diagnostic" | "Unknown",
                  "totalScore": number or null,
                  "maxScore": number or null,
                  "stage": "Mild Cognitive Impairment" | "Early Dementia" | "Moderate Dementia" | "Severe Dementia",
                  "recommendedStartLevel": 1 | 2 | 3,
                  "mtaScore": "string or null (e.g., Grade 3)",
                  "fazekasGrade": "string or null (e.g., Grade 1)",
                  "activeMedications": ["list", "of", "all", "current", "and", "newly", "prescribed", "medications"],
                  "subscaleScores": {
                    "orientation": { "score": 5, "max": 10 },
                    "registration": { "score": 3, "max": 3 },
                    "attention_calculation": { "score": 2, "max": 5 },
                    "recall": { "score": 0, "max": 3 },
                    "language_visuospatial": { "score": 9, "max": 9 }
                  },
                  "domains": {
                    "memory": { "needs_help": true, "impairment_level": "Severe", "score_pct": 0, "evidence": "Recall: 0/3 (Unable to recall 3 words after 5-minute delay)" },
                    "attention": { "needs_help": true, "impairment_level": "Moderate", "score_pct": 40, "evidence": "Attention & Calculation (Serial 7s): 2/5" },
                    "executive_function": { "needs_help": true, "impairment_level": "Severe", "score_pct": 25, "evidence": "Significant executive dysfunction" },
                    "orientation": { "needs_help": true, "impairment_level": "Moderate", "score_pct": 50, "evidence": "Orientation: 5/10" },
                    "language": { "needs_help": false, "impairment_level": "None", "score_pct": 100, "evidence": "Intact" },
                    "visuospatial": { "needs_help": true, "impairment_level": "Moderate", "score_pct": 35, "evidence": "Clock Drawing Test distortion" },
                    "decision_making": { "needs_help": true, "impairment_level": "Moderate", "score_pct": 40, "evidence": "Difficulty managing finances" },
                    "medication_management": { "needs_help": true, "impairment_level": "Severe", "score_pct": 0, "evidence": "Dependent on caregiver" },
                    "financial_management": { "needs_help": true, "impairment_level": "Severe", "score_pct": 0, "evidence": "Difficulty managing finances" },
                    "navigation": { "needs_help": true, "impairment_level": "Severe", "score_pct": 20, "evidence": "Confusion while driving" },
                    "meal_preparation": { "needs_help": true, "impairment_level": "Severe", "score_pct": 10, "evidence": "Dependent on caregiver" },
                    "driving": { "needs_help": true, "impairment_level": "Severe", "score_pct": 0, "evidence": "Advised against driving" },
                    "household_tasks": { "needs_help": true, "impairment_level": "Moderate", "score_pct": 30, "evidence": "Dependent on caregiver" },
                    "apathy": { "needs_help": true, "impairment_level": "Mild", "score_pct": 50, "evidence": "Mild apathy reported" },
                    "agitation": { "needs_help": true, "impairment_level": "Moderate", "score_pct": 40, "evidence": "Sundowning" },
                    "social_withdrawal": { "needs_help": true, "impairment_level": "Mild", "score_pct": 50, "evidence": "Social withdrawal" },
                    "sleep_disturbance": { "needs_help": true, "impairment_level": "Moderate", "score_pct": 40, "evidence": "Nighttime agitation" }
                  },
                  "clinicalSummary": "2-sentence neurological impression."
                }""".formatted(truncated);

        Map<String, Object> request = new HashMap<>();
        request.put("model", MODEL);
        request.put("prompt", prompt);
        request.put("format", "json");
        request.put("options", Map.of("temperature", 0.1));
        request.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                OLLAMA_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.get("response").asText();
        }

        throw new IOException("Ollama returned non-success: " + response.getStatusCode());
    }

    private MedicalProfile parseAndApplyResponse(String jsonResponse, MedicalProfile profile) {
        try {
            JsonNode node = objectMapper.readTree(jsonResponse);

            profile.setDiagnosis(node.has("diagnosis") ? node.get("diagnosis").asText(null) : null);
            profile.setIcd10(node.has("icd10") ? node.get("icd10").asText(null) : null);
            profile.setDateOfDiagnosis(node.has("dateOfDiagnosis") ? node.get("dateOfDiagnosis").asText(null) : null);
            profile.setExaminingPhysician(node.has("examiningPhysician") ? node.get("examiningPhysician").asText(null) : null);
            profile.setClinicOrHospital(node.has("clinicOrHospital") ? node.get("clinicOrHospital").asText(null) : null);
            profile.setTestType(node.has("testType") ? node.get("testType").asText("Unknown") : "Unknown");

            if (node.has("totalScore") && !node.get("totalScore").isNull()) {
                profile.setMmseScore(node.get("totalScore").asInt());
            } else if (node.has("score") && !node.get("score").isNull()) {
                profile.setMmseScore(node.get("score").asInt());
            }
            if (node.has("maxScore") && !node.get("maxScore").isNull()) {
                profile.setMaxScore(node.get("maxScore").asInt());
            }

            String stage = node.has("stage") ? node.get("stage").asText("Undetermined") : "Undetermined";
            profile.setClinicalStage(mapStage(stage));

            int startLevel = node.has("recommendedStartLevel") ? node.get("recommendedStartLevel").asInt(1) : 1;
            profile.setRecommendedStartDifficulty(Math.max(1, Math.min(3, startLevel)));

            profile.setMtaScore(node.has("mtaScore") ? node.get("mtaScore").asText(null) : null);
            profile.setFazekasGrade(node.has("fazekasGrade") ? node.get("fazekasGrade").asText(null) : null);

            if (node.has("activeMedications") && node.get("activeMedications").isArray()) {
                List<String> meds = objectMapper.convertValue(node.get("activeMedications"),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                profile.setMedicationsJson(objectMapper.writeValueAsString(meds));
            } else if (node.has("medications") && node.get("medications").isArray()) {
                List<String> meds = objectMapper.convertValue(node.get("medications"),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                profile.setMedicationsJson(objectMapper.writeValueAsString(meds));
            }

            String physicianNotes = node.has("physicianNotes") ? node.get("physicianNotes").asText("") : "";
            String clinicalSummary = node.has("clinicalSummary") ? node.get("clinicalSummary").asText("") : "";
            String llmSummary = !clinicalSummary.isEmpty() ? clinicalSummary : physicianNotes;
            profile.setLlmSummary(llmSummary);

            if (node.has("subscaleScores") && node.get("subscaleScores").isObject()) {
                profile.setSubscaleScoresJson(objectMapper.writeValueAsString(
                        objectMapper.convertValue(node.get("subscaleScores"),
                                new TypeReference<Map<String, MedicalProfileResponse.SubscaleScoreDto>>() {})));
            }

            if (node.has("domains") && node.get("domains").isObject()) {
                Map<String, DomainAssessment> domains = new LinkedHashMap<>();
                node.get("domains").fields().forEachRemaining(entry -> {
                    JsonNode d = entry.getValue();
                    DomainAssessment assessment = DomainAssessment.builder()
                            .needsHelp(d.has("needs_help") && d.get("needs_help").asBoolean())
                            .impairmentLevel(d.has("impairment_level") ? d.get("impairment_level").asText("Unknown") : "Unknown")
                            .scorePct(d.has("score_pct") ? d.get("score_pct").asInt(0) : 0)
                            .evidence(d.has("evidence") ? d.get("evidence").asText(null) : null)
                            .build();
                    domains.put(entry.getKey(), assessment);
                });
                profile.setClinicalDomainsJson(objectMapper.writeValueAsString(domains));
            }

            profile.setDetailedAnalysisJson(jsonResponse);

            return profile;
        } catch (Exception e) {
            log.error("Failed to parse Ollama JSON response: {}", e.getMessage());
            return applyDefaultProfile(profile, "Analysis parsing failed — baseline difficulty initialized");
        }
    }

    public MedicalProfile applyDefaultProfile(MedicalProfile profile, String summary) {
        profile.setClinicalStage("MCI");
        profile.setRecommendedStartDifficulty(1);
        profile.setTestType("Unknown");
        profile.setLlmSummary(summary);
        profile.setDiagnosis(null);
        profile.setIcd10(null);
        profile.setDateOfDiagnosis(null);
        profile.setExaminingPhysician(null);
        profile.setClinicOrHospital(null);
        profile.setMmseScore(null);
        profile.setMaxScore(null);
        profile.setMtaScore(null);
        profile.setFazekasGrade(null);
        profile.setImpairedDomains(null);
        profile.setPrimaryDeficits(null);
        profile.setMedicationsJson("[]");
        profile.setClinicalDomainsJson("{}");
        profile.setSubscaleScoresJson("{}");
        profile.setDetailedAnalysisJson(null);
        return profile;
    }

    private String mapStage(String ollamaStage) {
        if (ollamaStage == null) return "MCI";
        return switch (ollamaStage.toLowerCase()) {
            case "mild cognitive impairment", "mci" -> "MCI";
            case "early dementia" -> "Early Dementia";
            case "moderate dementia" -> "Moderate";
            case "severe dementia" -> "Severe";
            default -> "MCI";
        };
    }
}
