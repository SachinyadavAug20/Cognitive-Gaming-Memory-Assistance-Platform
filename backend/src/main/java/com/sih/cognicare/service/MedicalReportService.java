package com.sih.cognicare.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.DomainAssessment;
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
                You are an expert clinical neurologist and geriatric assessment specialist.
                Analyze the following patient medical report and extract structured diagnostic metrics, active medications, and a comprehensive 17-domain functional/cognitive assessment into STRICT JSON.

                Text:
                \"\"\"
                %s
                \"\"\"

                Return ONLY valid JSON matching this exact structure:
                {
                  "diagnosis": "string (e.g. Major Neurocognitive Disorder due to probable Alzheimer's Disease)",
                  "dateOfDiagnosis": "string (e.g. 08/20/2026)",
                  "testType": "MMSE" | "MoCA" | "General Diagnostic" | "Unknown",
                  "score": number or null,
                  "maxScore": number or null,
                  "stage": "Mild Cognitive Impairment" | "Early Dementia" | "Moderate Dementia" | "Severe Dementia",
                  "recommendedStartLevel": 1 | 2 | 3,
                  "medications": ["list", "of", "all", "active", "prescriptions"],
                  "physicianNotes": "Concise summary including MRI/imaging and neurological exam findings",
                  "domains": {
                    "memory": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "attention": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "executive_function": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "orientation": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "language": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "visuospatial": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "decision_making": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "medication_management": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "financial_management": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "navigation": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "meal_preparation": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "driving": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "household_tasks": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "apathy": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "agitation": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "social_withdrawal": { "needs_help": boolean, "evidence": "direct quote or null" },
                    "sleep_disturbance": { "needs_help": boolean, "evidence": "direct quote or null" }
                  }
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
            profile.setDateOfDiagnosis(node.has("dateOfDiagnosis") ? node.get("dateOfDiagnosis").asText(null) : null);
            profile.setTestType(node.has("testType") ? node.get("testType").asText("Unknown") : "Unknown");
            profile.setMmseScore(node.has("score") && !node.get("score").isNull() ? node.get("score").asInt() : null);
            profile.setMaxScore(node.has("maxScore") && !node.get("maxScore").isNull() ? node.get("maxScore").asInt() : null);

            String stage = node.has("stage") ? node.get("stage").asText("Undetermined") : "Undetermined";
            profile.setClinicalStage(mapStage(stage));

            int startLevel = node.has("recommendedStartLevel") ? node.get("recommendedStartLevel").asInt(1) : 1;
            profile.setRecommendedStartDifficulty(Math.max(1, Math.min(3, startLevel)));

            if (node.has("medications") && node.get("medications").isArray()) {
                List<String> meds = objectMapper.convertValue(node.get("medications"),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                profile.setMedicationsJson(objectMapper.writeValueAsString(meds));
            }

            String physicianNotes = node.has("physicianNotes") ? node.get("physicianNotes").asText("") : "";
            String summary = node.has("clinicalSummary") ? node.get("clinicalSummary").asText("") : "";
            String llmSummary = physicianNotes.isEmpty() ? summary : physicianNotes;
            profile.setLlmSummary(llmSummary);

            if (node.has("domains") && node.get("domains").isObject()) {
                Map<String, DomainAssessment> domains = new LinkedHashMap<>();
                node.get("domains").fields().forEachRemaining(entry -> {
                    JsonNode domainNode = entry.getValue();
                    DomainAssessment assessment = DomainAssessment.builder()
                            .needsHelp(domainNode.has("needs_help") && domainNode.get("needs_help").asBoolean())
                            .evidence(domainNode.has("evidence") ? domainNode.get("evidence").asText(null) : null)
                            .build();
                    domains.put(entry.getKey(), assessment);
                });
                profile.setClinicalDomainsJson(objectMapper.writeValueAsString(domains));
            }

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
        profile.setDateOfDiagnosis(null);
        profile.setMmseScore(null);
        profile.setMaxScore(null);
        profile.setImpairedDomains(null);
        profile.setPrimaryDeficits(null);
        profile.setMedicationsJson("[]");
        profile.setClinicalDomainsJson("{}");
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
