package com.sih.cognicare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.*;
import com.sih.cognicare.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OllamaReminiscenceService {

    private static final Logger log = LoggerFactory.getLogger(OllamaReminiscenceService.class);
    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String MODEL = "qwen2.5:1.5b";
    private static final int TIMEOUT_MS = 12_000;

    private final PatientRepository patientRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final FamiliarPlaceRepository familiarPlaceRepository;
    private final LifeStoryRepository lifeStoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OllamaReminiscenceService(
            PatientRepository patientRepository,
            FamilyMemberRepository familyMemberRepository,
            FamiliarPlaceRepository familiarPlaceRepository,
            LifeStoryRepository lifeStoryRepository) {
        this.patientRepository = patientRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.familiarPlaceRepository = familiarPlaceRepository;
        this.lifeStoryRepository = lifeStoryRepository;
    }

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3_000);
        factory.setReadTimeout(TIMEOUT_MS);
        return new RestTemplate(factory);
    }

    /**
     * 1. THE GRANDCHILD'S TEATIME CHAT: Conversational Reminiscence
     */
    public AiChatResponse generateChatResponse(AiChatRequest request) {
        Patient patient = request.getPatientId() != null
                ? patientRepository.findById(request.getPatientId()).orElse(null)
                : null;

        String patientName = patient != null ? patient.getName() : "Elder";
        String lang = patient != null && patient.getPreferredLanguage() != null ? patient.getPreferredLanguage() : "English";
        String culture = patient != null && patient.getCulturalBackground() != null ? patient.getCulturalBackground() : "North East India";
        String joyTriggers = patient != null && patient.getJoyTriggers() != null ? patient.getJoyTriggers() : "tea, folk songs, family stories";

        String persona = request.getPersonaName() != null ? request.getPersonaName() : "Rohan (Loving Grandchild)";
        String userMsg = request.getUserMessage() != null ? request.getUserMessage() : "Hello my dear grandchild.";

        String prompt = String.format(
                "You are %s speaking affectionately to your beloved elder %s from %s. " +
                "Their favorite things are: %s. Preferred language: %s. " +
                "Elder said: \"%s\". " +
                "Respond in 2-3 short, loving, ultra-simple sentences asking a nostalgic question about their past. " +
                "Return valid JSON strictly with keys: \"replyText\", \"emotionTone\", \"suggestedQuickReplies\" (array of 2 short reply options).",
                persona, patientName, culture, joyTriggers, lang, userMsg
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            String reply = node.has("replyText") ? node.get("replyText").asText() : "";
            String tone = node.has("emotionTone") ? node.get("emotionTone").asText() : "loving";
            List<String> quickReplies = new ArrayList<>();
            if (node.has("suggestedQuickReplies") && node.get("suggestedQuickReplies").isArray()) {
                for (JsonNode qr : node.get("suggestedQuickReplies")) {
                    quickReplies.add(qr.asText());
                }
            }
            if (quickReplies.isEmpty()) {
                quickReplies = List.of("Tell me more, dear!", "I remember it well.");
            }

            return AiChatResponse.builder()
                    .replyText(reply)
                    .spokenAudioText(reply)
                    .emotionTone(tone)
                    .suggestedQuickReplies(quickReplies)
                    .highlightedMemoryNote("Reminiscence Trigger: " + joyTriggers)
                    .build();
        } catch (Exception e) {
            log.warn("Ollama chat fallback triggered: {}", e.getMessage());
            return fallbackChatResponse(patientName, persona, joyTriggers);
        }
    }

    /**
     * 2. THE MEMORY DETECTIVE: Progressive 3-Tier Clues
     */
    public AiCluesResponse generateClues(AiCluesRequest request) {
        String targetName = request.getTargetName() != null ? request.getTargetName() : "Family Photo";
        String relation = request.getTargetRelationOrSignificance() != null ? request.getTargetRelationOrSignificance() : "Beloved Family Member";
        String notes = request.getTargetNotes() != null ? request.getTargetNotes() : "Cherished memories together";

        String prompt = String.format(
                "Generate 3 progressive guessing clues for a dementia patient to recognize %s (%s). Notes: %s. " +
                "Clue 1: Broad gentle hint. " +
                "Clue 2: Specific memory hint. " +
                "Clue 3: Direct identity hint. " +
                "Return JSON with keys: \"gentleClue1\", \"specificClue2\", \"directClue3\", \"encouragingEncouragement\".",
                targetName, relation, notes
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            return AiCluesResponse.builder()
                    .gentleClue1(node.path("gentleClue1").asText("I am someone very close to your heart who loves spending time with you."))
                    .specificClue2(node.path("specificClue2").asText("We shared wonderful memories together during family gatherings and tea times."))
                    .directClue3(node.path("directClue3").asText("It is " + targetName + "! Look at the loving smile in this photograph."))
                    .encouragingEncouragement(node.path("encouragingEncouragement").asText("Wonderful! Your memory is shining brightly today!"))
                    .candidateOptions(List.of(targetName, "Childhood Friend", "Village Neighbor"))
                    .build();
        } catch (Exception e) {
            log.warn("Ollama clues fallback triggered: {}", e.getMessage());
            return AiCluesResponse.builder()
                    .gentleClue1("I am someone very close to your heart who loves spending time with you.")
                    .specificClue2("We shared wonderful tea times and memories together: " + relation)
                    .directClue3("It is " + targetName + "! Look at this familiar, loving smile.")
                    .encouragingEncouragement("You recognized them beautifully! Well done!")
                    .candidateOptions(List.of(targetName, "Childhood Friend", "Old Colleague"))
                    .build();
        }
    }

    /**
     * 3. THE LIVING HERITAGE STORYBOOK: Branching Episodic Tales
     */
    public AiStoryResponse generateStoryChapter(AiStoryRequest request) {
        int chapter = Math.max(1, request.getCurrentChapterIndex());
        String theme = request.getTheme() != null ? request.getTheme() : "Morning Walk in the Hills";
        String choice = request.getPreviousChoiceMade() != null ? request.getPreviousChoiceMade() : "Begin Journey";

        String prompt = String.format(
                "Write Chapter %d of a gentle, comforting North East India nostalgia story about \"%s\". " +
                "The elder previously chose: \"%s\". " +
                "Keep narrative under 50 words with warm sensory details (mountain air, aroma of tea, birds). " +
                "Provide 2 simple branching choices for what to do next. " +
                "Return JSON with keys: \"chapterTitle\", \"chapterNarrative\", \"sensoryAtmosphere\", \"storyEmoji\", \"choices\" (array of { \"id\", \"label\", \"emoji\" }).",
                chapter, theme, choice
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            List<AiStoryResponse.StoryChoice> choices = new ArrayList<>();
            if (node.has("choices") && node.get("choices").isArray()) {
                for (JsonNode c : node.get("choices")) {
                    choices.add(AiStoryResponse.StoryChoice.builder()
                            .id(c.path("id").asText("choice-" + UUID.randomUUID().toString().substring(0, 4)))
                            .label(c.path("label").asText("Continue walking"))
                            .emoji(c.path("emoji").asText("🌿"))
                            .build());
                }
            }
            if (choices.isEmpty()) {
                choices = List.of(
                        AiStoryResponse.StoryChoice.builder().id("c1").label("Sit by the peaceful tea garden").emoji("☕").build(),
                        AiStoryResponse.StoryChoice.builder().id("c2").label("Walk across the wooden footbridge").emoji("🌉").build()
                );
            }

            return AiStoryResponse.builder()
                    .chapterNumber(chapter)
                    .chapterTitle(node.path("chapterTitle").asText("Chapter " + chapter + ": Golden Memories"))
                    .chapterNarrative(node.path("chapterNarrative").asText("The morning sun illuminates the green hills. A gentle mountain breeze carries the soothing scent of pine and fresh tea leaves."))
                    .sensoryAtmosphere(node.path("sensoryAtmosphere").asText("Fresh mountain pine & warm morning sunshine"))
                    .storyEmoji(node.path("storyEmoji").asText("🌄"))
                    .choices(choices)
                    .isFinale(chapter >= 4)
                    .build();
        } catch (Exception e) {
            log.warn("Ollama story fallback triggered: {}", e.getMessage());
            return fallbackStoryChapter(chapter, theme);
        }
    }

    /**
     * 4. THE HERITAGE BAZAAR BARTER: Interactive Market Simulation & IADL
     */
    public AiBazaarResponse generateBazaarTurn(AiBazaarRequest request) {
        Patient patient = request.getPatientId() != null
                ? patientRepository.findById(request.getPatientId()).orElse(null)
                : null;

        String patientName = patient != null ? patient.getName() : "Elder";
        String lang = patient != null && patient.getPreferredLanguage() != null ? patient.getPreferredLanguage() : "English";
        String market = request.getMarketName() != null ? request.getMarketName() : "Guwahati Fancy Bazaar";
        String item = request.getCurrentItem() != null ? request.getCurrentItem() : "Assam Golden Tips Tea";
        int budget = request.getBudgetRemaining() != null ? request.getBudgetRemaining() : 200;
        String userMsg = request.getUserSpokenMessage() != null ? request.getUserSpokenMessage() : "How much for this fresh tea?";

        String prompt = String.format(
                "You are a warm, courteous local shopkeeper at %s talking to customer %s in %s. " +
                "They are buying: %s. Their remaining budget: %d rupees. " +
                "Customer says: \"%s\". " +
                "Respond in 2 concise sentences with friendly shop dialogue, suggesting a fair price between 30 and 80 rupees. " +
                "Return valid JSON strictly with keys: \"merchantName\", \"merchantDialogue\", \"itemName\", \"finalPrice\" (integer), \"quickOptions\" (array of 2 strings), \"isDealClosed\" (boolean), \"culturalFact\".",
                market, patientName, lang, item, budget, userMsg
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            String merchant = node.has("merchantName") ? node.get("merchantName").asText() : "Deka Shopkeeper";
            String dialogue = node.has("merchantDialogue") ? node.get("merchantDialogue").asText() : "";
            int price = node.has("finalPrice") ? node.get("finalPrice").asInt(50) : 50;
            boolean dealClosed = node.has("isDealClosed") && node.get("isDealClosed").asBoolean();
            String fact = node.has("culturalFact") ? node.get("culturalFact").asText() : "Authentic organic harvest from Upper Assam.";

            List<String> options = new ArrayList<>();
            if (node.has("quickOptions") && node.get("quickOptions").isArray()) {
                for (JsonNode opt : node.get("quickOptions")) {
                    options.add(opt.asText());
                }
            }
            if (options.isEmpty()) {
                options = List.of("Yes, I will take it!", "Can you give a little discount, brother?");
            }

            int newBudget = Math.max(0, budget - (dealClosed ? price : 0));

            return AiBazaarResponse.builder()
                    .merchantName(merchant)
                    .merchantDialogue(dialogue)
                    .itemName(item)
                    .finalPrice(price)
                    .updatedBudget(newBudget)
                    .quickOptions(options)
                    .isDealClosed(dealClosed)
                    .culturalFact(fact)
                    .build();
        } catch (Exception e) {
            log.warn("Ollama bazaar fallback triggered: {}", e.getMessage());
            return fallbackBazaarResponse(item, budget);
        }
    }

    /**
     * 5. FOLK PROVERB & RHYME CLOZE: Cultural Cloze Association
     */
    public AiProverbResponse generateProverbChallenge(AiProverbRequest request) {
        Patient patient = request.getPatientId() != null
                ? patientRepository.findById(request.getPatientId()).orElse(null)
                : null;

        String lang = request.getLanguage() != null ? request.getLanguage() : (patient != null && patient.getPreferredLanguage() != null ? patient.getPreferredLanguage() : "English");
        String category = request.getCategory() != null ? request.getCategory() : "WISDOM";

        String prompt = String.format(
                "Generate a famous, inspiring traditional proverb or folk verse from North East India or pan-India heritage in %s. " +
                "Category: %s. " +
                "Create a cloze test by replacing one key word with \"_____\". " +
                "Return valid JSON strictly with keys: \"partialVerseWithBlank\", \"correctWord\", \"candidateOptions\" (array of 3 words including correctWord), \"fullProverb\", \"explanationAndWisdom\", \"regionOrigin\".",
                lang, category
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            String partial = node.has("partialVerseWithBlank") ? node.get("partialVerseWithBlank").asText() : "";
            String correct = node.has("correctWord") ? node.get("correctWord").asText() : "";
            String full = node.has("fullProverb") ? node.get("fullProverb").asText() : "";
            String wisdom = node.has("explanationAndWisdom") ? node.get("explanationAndWisdom").asText() : "";
            String origin = node.has("regionOrigin") ? node.get("regionOrigin").asText() : "Assam / North East India";

            List<String> candidates = new ArrayList<>();
            if (node.has("candidateOptions") && node.get("candidateOptions").isArray()) {
                for (JsonNode c : node.get("candidateOptions")) {
                    candidates.add(c.asText());
                }
            }
            if (!candidates.contains(correct) && !correct.isEmpty()) {
                candidates.add(0, correct);
            }
            if (candidates.size() < 3) {
                candidates = List.of(correct.isEmpty() ? "Patience" : correct, "Haste", "Gold");
            }

            return AiProverbResponse.builder()
                    .id(UUID.randomUUID().toString())
                    .category(category)
                    .partialVerseWithBlank(partial)
                    .correctWord(correct)
                    .candidateOptions(candidates)
                    .fullProverb(full)
                    .explanationAndWisdom(wisdom)
                    .regionOrigin(origin)
                    .build();
        } catch (Exception e) {
            log.warn("Ollama proverb fallback triggered: {}", e.getMessage());
            return fallbackProverbResponse(category);
        }
    }

    private String callOllama(String prompt) throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("model", MODEL);
        req.put("prompt", prompt);
        req.put("format", "json");
        req.put("stream", false);
        req.put("options", Map.of(
                "temperature", 0.3,
                "num_predict", 300,
                "num_ctx", 1024
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);

        ResponseEntity<String> response = createRestTemplate().exchange(
                OLLAMA_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.get("response").asText();
        }
        throw new RuntimeException("Ollama status: " + response.getStatusCode());
    }

    private AiChatResponse fallbackChatResponse(String patientName, String persona, String joyTriggers) {
        return AiChatResponse.builder()
                .replyText(String.format("It is so wonderful talking with you, %s! Tell me, do you remember our favorite tea time together?", patientName))
                .spokenAudioText(String.format("It is so wonderful talking with you! Tell me, do you remember our favorite tea time together?"))
                .emotionTone("warm")
                .suggestedQuickReplies(List.of("Yes, with sweet cardamom tea!", "Tell me another story, dear!"))
                .highlightedMemoryNote("Reminiscence Trigger: " + joyTriggers)
                .build();
    }

    private AiStoryResponse fallbackStoryChapter(int chapter, String theme) {
        return AiStoryResponse.builder()
                .chapterNumber(chapter)
                .chapterTitle("Chapter " + chapter + ": Sunlit Hilltop")
                .chapterNarrative("The golden morning sun warms the hillside path. Birds sing softly in the tall pine trees, inviting you to take another peaceful step forward.")
                .sensoryAtmosphere("Crisp mountain air & gentle birdsong")
                .storyEmoji("🌲")
                .choices(List.of(
                        AiStoryResponse.StoryChoice.builder().id("f1").label("Enjoy sweet cardamom tea on the veranda").emoji("☕").build(),
                        AiStoryResponse.StoryChoice.builder().id("f2").label("Listen to the gentle mountain river flow").emoji("🌊").build()
                ))
                .isFinale(chapter >= 4)
                .build();
    }

    private AiBazaarResponse fallbackBazaarResponse(String item, int budget) {
        return AiBazaarResponse.builder()
                .merchantName("Pranab (Fancy Bazaar Merchant)")
                .merchantDialogue(String.format("Welcome, Dadu! For this fresh %s, I will give you our best festive price of 40 rupees.", item))
                .itemName(item)
                .finalPrice(40)
                .updatedBudget(Math.max(0, budget - 40))
                .quickOptions(List.of("I will take it! Thank you.", "Give me 2 packets, brother."))
                .isDealClosed(true)
                .culturalFact("Fresh organic estate harvest packed in natural jute pouches.")
                .build();
    }

    private AiProverbResponse fallbackProverbResponse(String category) {
        return AiProverbResponse.builder()
                .id(UUID.randomUUID().toString())
                .category(category)
                .partialVerseWithBlank("Bihu marks the arrival of spring and _____ in every home.")
                .correctWord("Joy")
                .candidateOptions(List.of("Joy", "Frost", "Rain"))
                .fullProverb("Bihu marks the arrival of spring and joy in every home.")
                .explanationAndWisdom("Rongali Bihu represents the joy of new beginnings, planting season, and harvest celebration.")
                .regionOrigin("Assam Heritage Folk Traditions")
                .build();
    }
}
