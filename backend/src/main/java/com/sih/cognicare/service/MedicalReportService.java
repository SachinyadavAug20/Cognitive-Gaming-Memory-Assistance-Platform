package com.sih.cognicare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private static final int TIMEOUT_MS = 300_000;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(20_000);
        factory.setReadTimeout(TIMEOUT_MS);
        return new RestTemplate(factory);
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
            log.warn("Extracted text too short ({} chars). Scanned PDF detected.", extractedText == null ? 0 : extractedText.length());
            return applyDefaultProfile(profile, "Scanned document detected — baseline difficulty initialized.");
        }

        try {
            log.info("Extracted {} chars from PDF, preprocessing for optimized inference", extractedText.length());
            String cleanedText = preprocessClinicalText(extractedText);
            String ollamaResponse = callOllama(cleanedText);
            return parseAndApplyResponse(ollamaResponse, profile);
        } catch (Exception e) {
            log.error("Ollama analysis failed: {}", e.getMessage());
            return applyDefaultProfile(profile, "Ollama analysis failed — baseline difficulty initialized");
        }
    }

    private String extractTextFromPdf(File file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    /**
     * Aggressively compacts text to minimize input token processing time on CPU
     */
    private String preprocessClinicalText(String text) {
        String cleaned = text.replaceAll("\\r", "")
                            .replaceAll("[ \\t]+", " ")
                            .replaceAll("\\n{2,}", "\n")
                            .trim();

        if (cleaned.length() > 2500) {
            cleaned = cleaned.substring(0, 2500);
        }
        return cleaned;
    }

    private String callOllama(String pdfText) throws IOException {
        RestTemplate restTemplate = createRestTemplate();

        String prompt = """
            Analyze this clinical report and extract findings into STRICT JSON. Keep evidence quotes under 5 words.

            Report:
            \"\"\"%s\"\"\"

            Respond ONLY with this exact JSON structure:
            {
              "diagnosis": "string",
              "icd10": "string or null",
              "dateOfDiagnosis": "date string",
              "examiningPhysician": "string or null",
              "clinicOrHospital": "string or null",
              "testType": "MMSE" | "MoCA" | "General Diagnostic" | "Unknown",
              "totalScore": number or null,
              "maxScore": number or null,
              "stage": "Mild Cognitive Impairment" | "Early Dementia" | "Moderate Dementia" | "Severe Dementia",
              "recommendedStartLevel": 1 | 2 | 3,
              "mtaScore": "string or null",
              "fazekasGrade": "string or null",
              "activeMedications": ["medication 1", "medication 2"],
              "subscaleScores": {
                "orientation": { "score": number, "max": number },
                "registration": { "score": number, "max": number },
                "attention_calculation": { "score": number, "max": number },
                "recall": { "score": number, "max": number },
                "language_visuospatial": { "score": number, "max": number }
              },
              "domains": {
                "memory": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "attention": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "executive_function": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "orientation": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "language": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "visuospatial": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "decision_making": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "medication_management": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "financial_management": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "navigation": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "meal_preparation": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "driving": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "household_tasks": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "apathy": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "agitation": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "social_withdrawal": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" },
                "sleep_disturbance": { "needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number, "evidence": "quote" }
              },
              "clinicalSummary": "1-sentence summary"
            }
            """.formatted(pdfText);

        Map<String, Object> request = new HashMap<>();
        request.put("model", MODEL);
        request.put("prompt", prompt);
        request.put("format", "json");
        request.put("stream", false);
        request.put("options", Map.of(
            "temperature", 0.0,
            "num_predict", 1800
        ));

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

        throw new IOException("Ollama returned status: " + response.getStatusCode());
    }

    private MedicalProfile parseAndApplyResponse(String jsonResponse, MedicalProfile profile) {
        try {
            String repairedJson = repairJsonIfTruncated(jsonResponse.trim());
            JsonNode node = objectMapper.readTree(repairedJson);
            profile.setDetailedAnalysisJson(repairedJson);

            profile.setDiagnosis(node.hasNonNull("diagnosis") ? node.get("diagnosis").asText() : null);
            profile.setIcd10(node.hasNonNull("icd10") ? node.get("icd10").asText() : null);
            profile.setDateOfDiagnosis(node.hasNonNull("dateOfDiagnosis") ? node.get("dateOfDiagnosis").asText() : null);
            profile.setExaminingPhysician(node.hasNonNull("examiningPhysician") ? node.get("examiningPhysician").asText() : null);
            profile.setClinicOrHospital(node.hasNonNull("clinicOrHospital") ? node.get("clinicOrHospital").asText() : null);
            profile.setTestType(node.hasNonNull("testType") ? node.get("testType").asText("MMSE") : "MMSE");

            if (node.hasNonNull("totalScore")) {
                profile.setMmseScore(node.get("totalScore").asInt());
            }
            if (node.hasNonNull("maxScore")) {
                profile.setMaxScore(node.get("maxScore").asInt());
            }

            profile.setClinicalStage(node.hasNonNull("stage") ? node.get("stage").asText("Mild Cognitive Impairment") : "MCI");
            profile.setRecommendedStartDifficulty(node.hasNonNull("recommendedStartLevel") ? node.get("recommendedStartLevel").asInt(1) : 1);
            profile.setMtaScore(node.hasNonNull("mtaScore") ? node.get("mtaScore").asText() : null);
            profile.setFazekasGrade(node.hasNonNull("fazekasGrade") ? node.get("fazekasGrade").asText() : null);
            profile.setLlmSummary(node.hasNonNull("clinicalSummary") ? node.get("clinicalSummary").asText() : "");

            if (node.hasNonNull("activeMedications") && node.get("activeMedications").isArray()) {
                profile.setMedicationsJson(node.get("activeMedications").toString());
            }
            if (node.hasNonNull("subscaleScores")) {
                profile.setSubscaleScoresJson(node.get("subscaleScores").toString());
            }
            if (node.hasNonNull("domains")) {
                profile.setClinicalDomainsJson(node.get("domains").toString());
            }

            return profile;
        } catch (Exception e) {
            log.error("Failed to parse Ollama JSON: {}", e.getMessage());
            return applyDefaultProfile(profile, "JSON parsing error from Ollama response");
        }
    }

    private String repairJsonIfTruncated(String json) {
        if (json.endsWith("}")) return json;

        StringBuilder sb = new StringBuilder(json);
        int openBraces = 0;
        int openBrackets = 0;
        boolean inQuote = false;

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '"' && (i == 0 || json.charAt(i - 1) != '\\')) {
                inQuote = !inQuote;
            } else if (!inQuote) {
                if (c == '{') openBraces++;
                else if (c == '}') openBraces--;
                else if (c == '[') openBrackets++;
                else if (c == ']') openBrackets--;
            }
        }

        if (inQuote) sb.append("\"");
        while (openBrackets > 0) { sb.append("]"); openBrackets--; }
        while (openBraces > 0) { sb.append("}"); openBraces--; }

        return sb.toString();
    }

    public MedicalProfile applyDefaultProfile(MedicalProfile profile, String summary) {
        profile.setClinicalStage("MCI");
        profile.setRecommendedStartDifficulty(1);
        profile.setTestType("Unknown");
        profile.setLlmSummary(summary);
        return profile;
    }
}
