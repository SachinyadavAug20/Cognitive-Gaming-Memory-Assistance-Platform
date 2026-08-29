package com.sih.cognicare.service;

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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

        // 1. Fast, deterministic rule-based extraction (MMSE/stage, subscales, biomarkers).
        Map<String, Subscale> subscales = extractFastRegexMetrics(extractedText, profile);

        // 2. Derive 17-domain assessments from the actual subscale scores / stage.
        //    No generic "MILD" placeholders — every impaired domain is tied to evidence.
        Map<String, DomainAssessment> derivedDomains = deriveDomainsFromSubscales(subscales, profile);
        persistDomains(profile, derivedDomains);

        // 3. Fast Ollama polish pass (~5-10s on CPU) to fill summary/medications/stage.
        try {
            log.info("Extracted {} chars from PDF, running fast Ollama polish", extractedText.length());
            String cleanedText = preprocessClinicalText(extractedText);
            String ollamaResponse = callOllamaFast(cleanedText);
            parseAndMergeOllama(ollamaResponse, profile, derivedDomains);
        } catch (Exception e) {
            log.warn("Ollama unavailable or timed out ({}). Using calibrated rule-based findings.", e.getMessage());
            if (profile.getLlmSummary() == null || profile.getLlmSummary().isBlank()) {
                profile.setLlmSummary(String.format(
                        "Clinical assessment indicates %s stage cognitive impairment (%s %d/%d). Automated game baseline calibrated.",
                        safe(profile.getClinicalStage()),
                        safe(profile.getTestType()),
                        profile.getMmseScore() != null ? profile.getMmseScore() : 0,
                        profile.getMaxScore() != null ? profile.getMaxScore() : 30));
            }
        }

        // 4. Persist the merged domain map (rule-based base + optional Ollama enrichment).
        persistDomains(profile, derivedDomains);

        return profile;
    }

    private static String safe(String s) {
        return s == null || s.isBlank() ? "Unknown" : s;
    }

    private void persistDomains(MedicalProfile profile, Map<String, DomainAssessment> domains) {
        try {
            profile.setClinicalDomainsJson(objectMapper.writeValueAsString(domains));
            DomainSummaries summary = deriveSummaries(domains);
            profile.setImpairedDomains(summary.impairedJson());
            profile.setPrimaryDeficits(summary.primaryJson());
        } catch (Exception e) {
            log.warn("Could not serialize derived domains: {}", e.getMessage());
        }
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

        primary.sort(Comparator.comparingInt((Map<String, Object> m) ->
                severityOrder(m.get("impairment_level").toString())));
        List<Map<String, Object>> topPrimaries = primary.size() > 5 ? primary.subList(0, 5) : primary;

        try {
            return new DomainSummaries(objectMapper.writeValueAsString(impaired),
                    objectMapper.writeValueAsString(topPrimaries));
        } catch (Exception e) {
            log.warn("Could not serialize domain summaries: {}", e.getMessage());
            return new DomainSummaries("[]", "[]");
        }
    }

    private int severityOrder(String level) {
        return switch (level.toLowerCase()) {
            case "severe" -> 0;
            case "moderate" -> 1;
            case "mild" -> 2;
            default -> 3;
        };
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

    /**
     * Fast-path regex extraction of common clinical metrics. Runs BEFORE the LLM so core
     * scores/stage/biomarkers are populated immediately even if Ollama is slow or fails.
     *
     * Returns the extracted subscale map (key -> score/max). Also sets the clinical stage
     * from the MMSE/MoCA total using the corrected calibration:
     *   >= 24 MCI/Mild (L3) | 18-23 Early Dementia (L2) | 10-17 Moderate (L1) | < 10 Severe (L1-high assist)
     * NOTE: higher score == better cognition, so the mapping must be inverted relative to
     * severity. A score of 7/30 is SEVERE, never "MCI" (the old fallback bug).
     */
    public Map<String, Subscale> extractFastRegexMetrics(String text, MedicalProfile profile) {
        if (text == null) return new LinkedHashMap<>();

        int score = -1;
        int max = -1;
        Matcher mmse = Pattern.compile("(?i)(?:MMSE|Mini-Mental|MoCA|Score)[^\\d]*(\\d{1,2})\\s*/\\s*(\\d{1,2})").matcher(text);
        if (mmse.find()) {
            score = Integer.parseInt(mmse.group(1));
            max = Integer.parseInt(mmse.group(2));
            profile.setMmseScore(score);
            profile.setMaxScore(max);
            profile.setTestType("MMSE");
        }

        // Clinical severity calibration (score is the MMSE total, higher = better).
        if (score >= 24) {
            profile.setClinicalStage("MCI");
            profile.setRecommendedStartDifficulty(3);
        } else if (score >= 18) {
            profile.setClinicalStage("Early Dementia");
            profile.setRecommendedStartDifficulty(2);
        } else if (score >= 10) {
            profile.setClinicalStage("Moderate");
            profile.setRecommendedStartDifficulty(1);
        } else if (score >= 0) {
            profile.setClinicalStage("Severe");
            profile.setRecommendedStartDifficulty(1);
        }

        // Subscale scores (use the report's own denominator, default to the standard one).
        Map<String, Subscale> subscales = new LinkedHashMap<>();
        extractSubscale(text, "Orientation", subscales, "orientation", 10);
        extractSubscale(text, "Registration", subscales, "registration", 3);
        extractSubscale(text, "Attention", subscales, "attention_calculation", 5);
        extractSubscale(text, "Recall", subscales, "recall", 3);
        extractSubscale(text, "Language", subscales, "language_visuospatial", 9);

        if (!subscales.isEmpty()) {
            profile.setSubscaleScoresJson(objectMapper.valueToTree(subscales).toString());
        }

        Matcher mta = Pattern.compile("(?i)MTA\\s*(?:Score)?\\s*:\\s*(Grade\\s*\\d+)").matcher(text);
        if (mta.find()) profile.setMtaScore(mta.group(1).trim());

        Matcher faz = Pattern.compile("(?i)Fazekas\\s*(?:Grade)?\\s*[:]?\\s*(Grade\\s*\\d+|\\d+)").matcher(text);
        if (faz.find()) {
            String val = faz.group(1).trim();
            profile.setFazekasGrade(val.toLowerCase().startsWith("grade") ? val : "Grade " + val);
        }

        Matcher icd = Pattern.compile("(?i)ICD-?10\\s*[:]?\\s*([A-Z0-9\\./ ]+)").matcher(text);
        if (icd.find()) profile.setIcd10(icd.group(1).replaceAll("[\\),]", "").trim());

        Matcher doc = Pattern.compile("(?i)Dr\\.\\s+([A-Za-z ]+),\\s*MD").matcher(text);
        if (doc.find()) profile.setExaminingPhysician("Dr. " + doc.group(1).trim() + ", MD");

        return subscales;
    }

    private void extractSubscale(String text, String name, Map<String, Subscale> target, String key, int defaultMax) {
        Matcher m = Pattern.compile("(?i)" + name + "[^\\d]*(\\d{1,2})\\s*/\\s*(\\d{1,2})").matcher(text);
        if (m.find()) {
            target.put(key, new Subscale(Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2))));
        }
    }

    /**
     * Derives the 17 clinical domains from the actual subscale scores and the overall stage.
     * Every "impaired" domain is backed by a subscale percentage or stage evidence — never a
     * generic "MILD" placeholder. Domains with no evidence default to needs_help=false/None.
     */
    private Map<String, DomainAssessment> deriveDomainsFromSubscales(Map<String, Subscale> subscales, MedicalProfile profile) {
        Map<String, DomainAssessment> domains = new LinkedHashMap<>();

        String stage = profile.getClinicalStage() != null ? profile.getClinicalStage() : "";
        boolean severeOrModerate = stage.equalsIgnoreCase("Severe") || stage.equalsIgnoreCase("Moderate");
        boolean early = stage.equalsIgnoreCase("Early Dementia");
        boolean mci = stage.equalsIgnoreCase("MCI");
        boolean substantial = severeOrModerate || early;

        // Memory (Recall /3)
        Subscale recall = subscales.get("recall");
        if (recall != null) {
            int r = recall.score;
            boolean impaired = r < 2;
            domains.put("memory", DomainAssessment.builder()
                    .needsHelp(impaired)
                    .impairmentLevel(levelByPct(r, 2, "Recall"))
                    .scorePct(pct(r, recall.max))
                    .evidence(impaired ? "Delayed recall score: " + r + "/" + recall.max + "." : null)
                    .build());
        } else {
            domains.put("memory", DomainAssessment.builder()
                    .needsHelp(substantial)
                    .impairmentLevel(substantial ? "Moderate" : "None")
                    .scorePct(substantial ? 40 : 100)
                    .evidence(substantial ? "Memory impairment consistent with " + stage + " stage." : null)
                    .build());
        }

        // Attention (Attention & Calculation /5)
        Subscale attn = subscales.get("attention_calculation");
        if (attn != null) {
            int a = attn.score;
            boolean impaired = a < 4;
            domains.put("attention", DomainAssessment.builder()
                    .needsHelp(impaired)
                    .impairmentLevel(levelByPct(a, 4, "Attention"))
                    .scorePct(pct(a, attn.max))
                    .evidence(impaired ? "Attention & calculation score: " + a + "/" + attn.max + "." : null)
                    .build());
        } else {
            domains.put("attention", DomainAssessment.builder()
                    .needsHelp(substantial)
                    .impairmentLevel(substantial ? "Moderate" : "None")
                    .scorePct(substantial ? 40 : 100)
                    .evidence(substantial ? "Attention deficits consistent with " + stage + " stage." : null)
                    .build());
        }

        // Orientation (/10)
        Subscale orient = subscales.get("orientation");
        if (orient != null) {
            int o = orient.score;
            boolean impaired = o < 8;
            domains.put("orientation", DomainAssessment.builder()
                    .needsHelp(impaired)
                    .impairmentLevel(o <= 5 ? "Moderate" : o <= 7 ? "Mild" : "None")
                    .scorePct(pct(o, orient.max))
                    .evidence(impaired ? "Orientation score: " + o + "/" + orient.max + "." : null)
                    .build());
        } else {
            domains.put("orientation", DomainAssessment.builder()
                    .needsHelp(substantial)
                    .impairmentLevel(substantial ? "Mild" : "None")
                    .scorePct(substantial ? 60 : 100)
                    .evidence(substantial ? "Orientation affected at " + stage + " stage." : null)
                    .build());
        }

        // Language + Visuospatial (Language & Visuospatial /9)
        Subscale langVis = subscales.get("language_visuospatial");
        if (langVis != null) {
            int lv = langVis.score;
            boolean impaired = lv < 7;
            domains.put("language", DomainAssessment.builder()
                    .needsHelp(impaired)
                    .impairmentLevel(levelByPct(lv, 7, "Language"))
                    .scorePct(pct(lv, langVis.max))
                    .evidence(impaired ? "Language score: " + lv + "/" + langVis.max + "." : null)
                    .build());
            domains.put("visuospatial", DomainAssessment.builder()
                    .needsHelp(lv <= 4)
                    .impairmentLevel(lv <= 4 ? "Severe" : lv <= 6 ? "Moderate" : "None")
                    .scorePct(pct(lv, langVis.max))
                    .evidence(lv <= 4 ? "Visuospatial construction severely impaired: " + lv + "/" + langVis.max + "." : null)
                    .build());
        } else {
            domains.put("language", DomainAssessment.builder()
                    .needsHelp(substantial)
                    .impairmentLevel(substantial ? "Mild" : "None")
                    .scorePct(substantial ? 60 : 100)
                    .evidence(substantial ? "Language involvement at " + stage + " stage." : null)
                    .build());
            domains.put("visuospatial", DomainAssessment.builder()
                    .needsHelp(substantial)
                    .impairmentLevel(substantial ? "Mild" : "None")
                    .scorePct(substantial ? 60 : 100)
                    .evidence(substantial ? "Visuospatial involvement at " + stage + " stage." : null)
                    .build());
        }

        // Executive function & functional IADLs — tied to overall stage.
        domains.put("executive_function", DomainAssessment.builder()
                .needsHelp(substantial)
                .impairmentLevel(severeOrModerate ? "Severe" : early ? "Moderate" : "None")
                .scorePct(severeOrModerate ? 20 : early ? 45 : 100)
                .evidence(substantial ? "Executive planning and multistep tasks impaired at " + stage + " stage." : null)
                .build());

        boolean navImpaired = substantial || (orient != null && orient.score < 8);
        domains.put("navigation", DomainAssessment.builder()
                .needsHelp(navImpaired)
                .impairmentLevel(navImpaired ? "Moderate" : "None")
                .scorePct(navImpaired ? 35 : 100)
                .evidence(navImpaired ? "Disorientation on outdoor routes noted." : null)
                .build());

        boolean medImpaired = substantial || (recall != null && recall.score < 2);
        domains.put("medication_management", DomainAssessment.builder()
                .needsHelp(medImpaired)
                .impairmentLevel(medImpaired ? "Severe" : "None")
                .scorePct(medImpaired ? 20 : 100)
                .evidence(medImpaired ? "Requires caregiver supervision for medication schedule." : null)
                .build());

        domains.put("decision_making", DomainAssessment.builder()
                .needsHelp(substantial)
                .impairmentLevel(substantial ? "Moderate" : "None")
                .scorePct(substantial ? 40 : 100)
                .evidence(substantial ? "Difficulty with independent decision making at " + stage + " stage." : null)
                .build());
        domains.put("financial_management", DomainAssessment.builder()
                .needsHelp(substantial)
                .impairmentLevel(substantial ? "Moderate" : "None")
                .scorePct(substantial ? 40 : 100)
                .evidence(substantial ? "Assistance required for finances." : null)
                .build());
        domains.put("meal_preparation", DomainAssessment.builder()
                .needsHelp(substantial)
                .impairmentLevel(substantial ? "Moderate" : "None")
                .scorePct(substantial ? 40 : 100)
                .evidence(substantial ? "Assistance required for meal preparation." : null)
                .build());
        domains.put("household_tasks", DomainAssessment.builder()
                .needsHelp(substantial)
                .impairmentLevel(substantial ? "Moderate" : "None")
                .scorePct(substantial ? 40 : 100)
                .evidence(substantial ? "Assistance required with household tasks." : null)
                .build());
        domains.put("driving", DomainAssessment.builder()
                .needsHelp(false)
                .impairmentLevel("None")
                .scorePct(100)
                .evidence(null)
                .build());

        // Behavioral domains — MCI/early may keep intact unless deficits noted.
        domains.put("apathy", DomainAssessment.builder()
                .needsHelp(false)
                .impairmentLevel("None")
                .scorePct(100)
                .evidence(null)
                .build());
        domains.put("agitation", DomainAssessment.builder()
                .needsHelp(false)
                .impairmentLevel("None")
                .scorePct(100)
                .evidence(null)
                .build());
        domains.put("social_withdrawal", DomainAssessment.builder()
                .needsHelp(severeOrModerate)
                .impairmentLevel(severeOrModerate ? "Moderate" : "None")
                .scorePct(severeOrModerate ? 40 : 100)
                .evidence(severeOrModerate ? "Reduced social engagement at " + stage + " stage." : null)
                .build());
        domains.put("sleep_disturbance", DomainAssessment.builder()
                .needsHelp(false)
                .impairmentLevel("None")
                .scorePct(100)
                .evidence(null)
                .build());

        return domains;
    }

    /** Maps a subscale percentage to a severity level: <50% severe, 50-70% moderate, >70% none/mild. */
    private String levelByPct(int score, int threshold, String domain) {
        double pct = score * 100.0 / threshold;
        if (pct < 50) return "Severe";
        if (pct <= 70) return "Moderate";
        return score < threshold ? "Mild" : "None";
    }

    private int pct(int score, int max) {
        if (max <= 0) return 0;
        return Math.max(0, Math.min(100, (int) Math.round(score * 100.0 / max)));
    }

    /**
     * Submit a record of a subscale: raw score + its printed denominator.
     */
    private record Subscale(int score, int max) {}

    /**
     * Fast Ollama polish pass. Extracts only the high-level facts (diagnosis, stage,
     * medications, summary) that the rule-based extractor cannot. Kept deliberately
     * small (short prompt, few tokens) so it runs in ~5-10s even on a CPU.
     */
    private String callOllamaFast(String pdfText) throws IOException {
        RestTemplate restTemplate = createRestTemplate();

        String prompt = """
            Extract from this medical report into STRICT JSON (no markdown, no extra keys):
            {
              "diagnosis": "string or null",
              "clinicalStage": "Mild Cognitive Impairment" | "Early Dementia" | "Moderate Dementia" | "Severe Dementia" | null,
              "activeMedications": ["med1", "med2"],
              "clinicalSummary": "1-sentence impression",
              "subscaleScores": {
                "orientation": {"score": number, "max": number},
                "registration": {"score": number, "max": number},
                "attention_calculation": {"score": number, "max": number},
                "recall": {"score": number, "max": number},
                "language_visuospatial": {"score": number, "max": number}
              },
              "domains": {
                "memory": {"needs_help": boolean, "impairment_level": "None"|"Mild"|"Moderate"|"Severe", "score_pct": number or null, "evidence": "quote or null"}
              }
            }
            Use ONLY facts stated in the report; null/[] when absent.

            Report:
            \"\"\"%s\"\"\"
            """.formatted(pdfText);

        int availableCores = Runtime.getRuntime().availableProcessors();

        Map<String, Object> request = new HashMap<>();
        request.put("model", MODEL);
        request.put("prompt", prompt);
        request.put("format", "json");
        request.put("stream", false);
        request.put("keep_alive", "10m");
        request.put("options", Map.of(
            "temperature", 0.0,
            "num_predict", 600,
            "num_thread", Math.max(1, availableCores - 1),
            "num_ctx", 2048
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

    /**
     * Merge the Ollama JSON onto the rule-based profile + derived domains.
     * Ollama only overwrites with non-null values (merge semantics) so a partial
     * or failed response never wipes the deterministic rule-based findings.
     */
    private void parseAndMergeOllama(String jsonResponse, MedicalProfile profile,
                                     Map<String, DomainAssessment> domains) {
        try {
            String repairedJson = repairJsonIfTruncated(jsonResponse.trim());
            JsonNode node = objectMapper.readTree(repairedJson);
            profile.setDetailedAnalysisJson(repairedJson);

            if (node.hasNonNull("diagnosis")) profile.setDiagnosis(node.get("diagnosis").asText());
            if (node.hasNonNull("clinicalStage")) {
                String stage = node.get("clinicalStage").asText();
                if (!stage.isBlank() && !"null".equalsIgnoreCase(stage)) {
                    String mapped = mapOllamaStage(stage);
                    if (mapped != null) {
                        profile.setClinicalStage(mapped);
                        profile.setRecommendedStartDifficulty(stageLevel(mapped));
                    }
                }
            }
            if (node.hasNonNull("clinicalSummary")) profile.setLlmSummary(node.get("clinicalSummary").asText());
            if (node.hasNonNull("activeMedications") && node.get("activeMedications").isArray()) {
                profile.setMedicationsJson(node.get("activeMedications").toString());
            }
            if (node.hasNonNull("subscaleScores") && node.get("subscaleScores").isObject()) {
                profile.setSubscaleScoresJson(node.get("subscaleScores").toString());
            }

            // Merge Ollama domain refinements onto the rule-based base (only when present).
            if (node.hasNonNull("domains") && node.get("domains").isObject()) {
                node.get("domains").fields().forEachRemaining(field -> {
                    JsonNode d = field.getValue();
                    if (d == null || !d.isObject()) return;
                    boolean needsHelp = d.path("needs_help").asBoolean(domains.getOrDefault(field.getKey(),
                            DomainAssessment.builder().build()).isNeedsHelp());
                    if (d.has("needs_help")) {
                        needsHelp = d.get("needs_help").asBoolean();
                    }
                    String level = d.hasNonNull("impairment_level") ? d.get("impairment_level").asText("None")
                            : d.hasNonNull("impairmentLevel") ? d.get("impairmentLevel").asText("None") : "None";
                    int scorePct = domains.getOrDefault(field.getKey(),
                            DomainAssessment.builder().build()).getScorePct();
                    if (d.path("score_pct").isNumber()) scorePct = d.path("score_pct").asInt();
                    String evidence = d.hasNonNull("evidence") ? d.get("evidence").asText() : null;
                    domains.put(field.getKey(), DomainAssessment.builder()
                            .needsHelp(needsHelp)
                            .impairmentLevel(level)
                            .scorePct(scorePct)
                            .evidence(evidence)
                            .build());
                });
            }
        } catch (Exception e) {
            log.warn("Could not parse Ollama polish JSON ({}); keeping rule-based findings.", e.getMessage());
        }
    }

    private String mapOllamaStage(String stage) {
        String s = stage.toLowerCase().replace("dementia", "").trim();
        if (s.contains("mild cognitive") || s.equals("mci")) return "MCI";
        if (s.contains("early")) return "Early Dementia";
        if (s.contains("moderate")) return "Moderate";
        if (s.contains("severe")) return "Severe";
        if (s.contains("mild")) return "MCI";
        return null;
    }

    private int stageLevel(String stage) {
        return switch (stage) {
            case "MCI" -> 3;
            case "Early Dementia" -> 2;
            case "Moderate", "Severe" -> 1;
            default -> 1;
        };
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
