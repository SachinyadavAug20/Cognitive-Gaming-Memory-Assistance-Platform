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
import java.util.stream.Collectors;

@Service
public class OllamaReminiscenceService {

    private static final Logger log = LoggerFactory.getLogger(OllamaReminiscenceService.class);
    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String OLLAMA_CHAT_URL = "http://localhost:11434/api/chat";
    private static final String MODEL = "qwen2.5:1.5b";
    private static final int TIMEOUT_MS = 45_000;

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

    private Patient resolvePatient(Long patientId) {
        if (patientId != null && patientId > 0) {
            Optional<Patient> p = patientRepository.findById(patientId);
            if (p.isPresent()) return p.get();
        }
        return patientRepository.findAll().stream().findFirst().orElse(null);
    }

    /**
     * 1. THE GRANDCHILD'S TEATIME CHAT: Conversational Reminiscence
     */
    public AiChatResponse generateChatResponse(AiChatRequest request) {
        Patient patient = resolvePatient(request.getPatientId());

        String patientName = patient != null ? patient.getName() : "Pratima Borah";
        String gender = patient != null && patient.getGender() != null ? patient.getGender() : "FEMALE";
        String lang = patient != null && patient.getPreferredLanguage() != null ? patient.getPreferredLanguage() : "English";
        String culture = patient != null && patient.getCulturalBackground() != null ? patient.getCulturalBackground() : "North East India (Assam)";
        String joyTriggers = patient != null && patient.getJoyTriggers() != null ? patient.getJoyTriggers() : "gardening, traditional Khar cooking, listening to Bihu folk songs, morning tea";

        // Extract deep family, life story, and place context
        List<FamilyMember> familyMembers = patient != null
                ? familyMemberRepository.findByPatientId(patient.getId())
                : Collections.emptyList();
        String familyContext = familyMembers.stream()
                .map(f -> String.format("%s (%s: %s)", f.getName(), f.getRelation() != null ? f.getRelation() : "Family", f.getNotes() != null ? f.getNotes() : ""))
                .collect(Collectors.joining(", "));
        if (familyContext.isBlank()) {
            familyContext = "Manash Borah (Son: Loving son who works in Guwahati), Ananya Borah (Daughter: Lives nearby and visits on weekends)";
        }

        LifeStory lifeStory = patient != null
                ? lifeStoryRepository.findByPatientId(patient.getId()).orElse(null)
                : null;
        String occupation = lifeStory != null && lifeStory.getOccupation() != null ? lifeStory.getOccupation() : "Former School Teacher";
        String hobbies = lifeStory != null && lifeStory.getHobbies() != null ? lifeStory.getHobbies() : "Gardening, traditional cooking, embroidery";

        List<FamiliarPlace> places = patient != null
                ? familiarPlaceRepository.findByPatientId(patient.getId())
                : Collections.emptyList();
        String placesContext = places.stream()
                .map(p -> p.getName() + (p.getDescription() != null ? " (" + p.getDescription() + ")" : ""))
                .collect(Collectors.joining(", "));
        if (placesContext.isBlank()) {
            placesContext = "Courtyard garden in Jorhat, Brahmaputra riverfront, Majuli Island";
        }

        // Parse Persona Name & Relation
        String rawPersona = request.getPersonaName() != null ? request.getPersonaName() : "Manash Borah (Son)";
        String personaName = "Manash Borah";
        String personaRelation = "Son";
        if (rawPersona.contains("(") && rawPersona.contains(")")) {
            personaName = rawPersona.substring(0, rawPersona.indexOf("(")).trim();
            personaRelation = rawPersona.substring(rawPersona.indexOf("(") + 1, rawPersona.indexOf(")")).trim();
        } else if (rawPersona.contains("-")) {
            String[] parts = rawPersona.split("-");
            personaName = parts[0].trim();
            personaRelation = parts.length > 1 ? parts[1].trim() : "Family Member";
        }

        // Determine authentic affectionate Indian salutation
        boolean isFemale = "FEMALE".equalsIgnoreCase(gender);
        String salutation = isFemale ? "Maa" : "Baba";
        if (personaRelation.toLowerCase().contains("grandchild") || personaRelation.toLowerCase().contains("grandson") || personaRelation.toLowerCase().contains("granddaughter")) {
            salutation = isFemale ? "Aita" : "Koka";
        }

        String userMsg = request.getUserMessage() != null ? request.getUserMessage().trim() : "Hello my dear.";

        List<AiChatRequest.ChatMessage> rawHistory = request.getConversationHistory() != null
                ? request.getConversationHistory()
                : Collections.emptyList();

        // Omit current userMsg if already appended to the tail of rawHistory by the client
        int historyEnd = rawHistory.size();
        if (historyEnd > 0 && userMsg.equalsIgnoreCase(rawHistory.get(historyEnd - 1).getText())) {
            historyEnd--;
        }
        boolean isFirstTurn = historyEnd <= 0;

        // Structured Ollama Chat Messages
        List<Map<String, String>> chatMessages = new ArrayList<>();

        String systemPrompt = String.format(
                "You are roleplaying as %s (%s), sitting having morning tea with your %s, %s. Your name is %s. " +
                "Speak warmly, affectionately, and naturally in 1-2 spoken sentences as a real family member.\n" +
                "RULES:\n" +
                "1. Answer %s directly. Never ignore what she says.\n" +
                "2. %s\n" +
                "3. If %s asks who you are or your name (even with typos like 'what is your nae', 'who are you', 'son', 'naam'), warmly clarify: 'I am your %s, %s, %s!' and ask how she is feeling.\n" +
                "4. Understand elder typos and intent (e.g. 'nae' means 'name').\n" +
                "5. NEVER use repetitive robotic filler phrases like 'your love and care mean everything to me'. Speak like a real devoted %s.\n" +
                "6. Return strictly valid JSON: {\"replyText\": \"...\", \"emotionTone\": \"loving\", \"suggestedQuickReplies\": [\"...\", \"...\"]}",
                personaName, personaRelation, salutation, patientName, personaName,
                salutation,
                isFirstTurn ? "Start with a warm morning greeting." : "CRITICAL: The conversation is already active. DO NOT say 'Good morning' or repeat greetings! Directly answer her comment.",
                salutation,
                personaRelation, personaName, salutation,
                personaRelation
        );

        chatMessages.add(Map.of("role", "system", "content", systemPrompt));

        int startIdx = Math.max(0, historyEnd - 4);
        for (int i = startIdx; i < historyEnd; i++) {
            AiChatRequest.ChatMessage msg = rawHistory.get(i);
            String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "assistant";
            chatMessages.add(Map.of("role", role, "content", msg.getText()));
        }

        chatMessages.add(Map.of("role", "user", "content", userMsg));

        try {
            String jsonOutput = callOllamaChat(chatMessages);
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
                quickReplies = List.of("Tell me more, dear!", "Let us enjoy our tea together.");
            }

            if (reply.isBlank() || reply.toLowerCase().contains("hello, elder")) {
                return fallbackChatResponse(patientName, personaName, personaRelation, salutation, userMsg, joyTriggers, isFirstTurn);
            }

            return AiChatResponse.builder()
                    .replyText(reply)
                    .spokenAudioText(reply)
                    .emotionTone(tone)
                    .suggestedQuickReplies(quickReplies)
                    .highlightedMemoryNote("Reminiscence Context: " + personaName + " (" + personaRelation + ")")
                    .build();
        } catch (Exception e) {
            log.warn("Ollama chat fallback triggered: {}", e.getMessage());
            return fallbackChatResponse(patientName, personaName, personaRelation, salutation, userMsg, joyTriggers, isFirstTurn);
        }
    }

    private AiChatResponse fallbackChatResponse(
            String patientName,
            String personaName,
            String personaRelation,
            String salutation,
            String userMsg,
            String joyTriggers,
            boolean isFirstTurn) {

        String lower = userMsg.toLowerCase().trim();
        String reply;
        List<String> quickReplies;

        boolean asksIdentity = lower.contains("name") || lower.contains("nae") || lower.contains("naem") ||
                lower.contains("who are you") || lower.contains("who r u") || lower.contains("who you") ||
                lower.contains("who u") || lower.contains("koun") || lower.contains("kon") ||
                lower.contains("naam") || lower.contains("identity") || lower.contains("son") ||
                lower.contains("daughter") || lower.contains("grandson");

        if (asksIdentity) {
            reply = String.format("I am your %s, %s, %s! I'm right here having morning tea with you. How are you feeling today?", personaRelation, personaName, salutation);
            quickReplies = List.of("Yes, my dear " + personaName + "!", "Pour me some more tea.");
        } else if (isFirstTurn && (lower.contains("hi") || lower.contains("hello") || lower.contains("namaste") || lower.contains("morning"))) {
            reply = String.format("Good morning, %s! It brings me so much happiness to sit with you today.", salutation);
            quickReplies = List.of("Good morning, " + personaName + "!", "How is your day going?");
        } else if (lower.contains("where") || lower.contains("place") || lower.contains("home") || lower.contains("ghar")) {
            reply = String.format("You are safe at home with me in Jorhat, %s. Everything is peaceful and calm.", salutation);
            quickReplies = List.of("Thank you, my dear.", "The garden looks so beautiful.");
        } else if (lower.contains("tea") || lower.contains("chai") || lower.contains("cup") || lower.contains("drink")) {
            reply = String.format("Here is a fresh cup of Assam cardamom tea for you, %s! Just the way you like it.", salutation);
            quickReplies = List.of("It smells wonderful!", "Tell me about your week.");
        } else {
            reply = String.format("It is always so comforting being with you, %s! Shall I tell you about our garden in Jorhat?", salutation);
            quickReplies = List.of("Tell me a story from the garden!", "Let us drink our tea in peace.");
        }

        return AiChatResponse.builder()
                .replyText(reply)
                .spokenAudioText(reply)
                .emotionTone("warm")
                .suggestedQuickReplies(quickReplies)
                .highlightedMemoryNote("Reminiscence: " + personaName + " (" + personaRelation + ")")
                .build();
    }

    /**
     * 2. THE MEMORY DETECTIVE: Progressive 3-Tier Clues
     */
    public AiCluesResponse generateClues(AiCluesRequest request) {
        Patient patient = resolvePatient(request.getPatientId());
        String patientName = patient != null ? patient.getName() : "Pratima Borah";
        String targetName = request.getTargetName() != null ? request.getTargetName() : "Family Photo";
        String relation = request.getTargetRelationOrSignificance() != null ? request.getTargetRelationOrSignificance() : "Beloved Family Member";
        String notes = request.getTargetNotes() != null ? request.getTargetNotes() : "Cherished family memories together";

        // Pull real family member names for accurate candidate options
        List<FamilyMember> family = patient != null ? familyMemberRepository.findByPatientId(patient.getId()) : Collections.emptyList();
        List<String> candidateNames = new ArrayList<>();
        candidateNames.add(targetName);
        for (FamilyMember f : family) {
            if (!f.getName().equalsIgnoreCase(targetName) && candidateNames.size() < 3) {
                candidateNames.add(f.getName());
            }
        }
        if (candidateNames.size() < 3) candidateNames.add("Childhood Neighbor");
        if (candidateNames.size() < 3) candidateNames.add("School Colleague");

        String prompt = String.format(
                "You are an encouraging cognitive memory guide helping %s recognize %s (%s).\n" +
                "MEMORIES & CONTEXT: %s.\n\n" +
                "GENERATE 3 PROGRESSIVE CLUES:\n" +
                "- Clue 1 (Gentle): A warm, broad relationship hint without revealing the name.\n" +
                "- Clue 2 (Specific): A specific shared memory hint mentioning family gatherings, tea times, or places.\n" +
                "- Clue 3 (Direct): A clear revelation of who this is with loving encouragement: 'It is your %s, %s!'\n\n" +
                "Return strictly valid JSON with keys:\n" +
                "\"gentleClue1\", \"specificClue2\", \"directClue3\", \"encouragingEncouragement\", \"candidateOptions\" (array of 3 distinct names including %s).",
                patientName, targetName, relation, notes, relation, targetName, targetName
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            List<String> options = new ArrayList<>();
            if (node.has("candidateOptions") && node.get("candidateOptions").isArray()) {
                for (JsonNode opt : node.get("candidateOptions")) {
                    options.add(opt.asText());
                }
            }
            if (options.isEmpty() || !options.contains(targetName)) {
                options = candidateNames;
            }

            return AiCluesResponse.builder()
                    .gentleClue1(node.path("gentleClue1").asText("This person is very close to your heart and always brings happiness to your home."))
                    .specificClue2(node.path("specificClue2").asText("You shared many wonderful moments together: " + relation + " (" + notes + ")."))
                    .directClue3(node.path("directClue3").asText("It is your beloved " + targetName + "! Look at their loving smile in this photograph."))
                    .encouragingEncouragement(node.path("encouragingEncouragement").asText("Wonderful! Your memory shines so brightly today!"))
                    .candidateOptions(options)
                    .build();
        } catch (Exception e) {
            log.warn("Ollama clues fallback triggered: {}", e.getMessage());
            return AiCluesResponse.builder()
                    .gentleClue1("This person is very close to your heart and always brings happiness to your home.")
                    .specificClue2("You shared many wonderful moments together: " + relation + " (" + notes + ").")
                    .directClue3("It is your beloved " + targetName + "! Look at their loving smile in this photograph.")
                    .encouragingEncouragement("Wonderful! Your memory shines so brightly today!")
                    .candidateOptions(candidateNames)
                    .build();
        }
    }

    /**
     * 3. THE LIVING HERITAGE STORYBOOK: Branching Episodic Tales
     */
    public AiStoryResponse generateStoryChapter(AiStoryRequest request) {
        Patient patient = resolvePatient(request.getPatientId());
        String patientName = patient != null ? patient.getName() : "Pratima Borah";
        int chapter = Math.max(1, request.getCurrentChapterIndex());
        String theme = request.getTheme() != null ? request.getTheme() : "Morning Walk in the Hills";
        String choice = request.getPreviousChoiceMade() != null ? request.getPreviousChoiceMade() : "Begin Journey";

        // Extract familiar places for storytelling
        List<FamiliarPlace> places = patient != null ? familiarPlaceRepository.findByPatientId(patient.getId()) : Collections.emptyList();
        String placesSummary = places.stream().map(FamiliarPlace::getName).collect(Collectors.joining(", "));
        if (placesSummary.isBlank()) placesSummary = "Majuli River Island, Kaziranga tea hills, Brahmaputra riverfront";

        String prompt = String.format(
                "Write Chapter %d of a gentle, comforting North East India nostalgia story for %s about \"%s\".\n" +
                "FAMILIAR PLACES: %s.\n" +
                "PREVIOUS CHOICE: The reader chose \"%s\".\n\n" +
                "INSTRUCTIONS:\n" +
                "1. Keep the chapter narrative under 45 words with soothing sensory details (mountain air, aroma of tea, chirping songbirds).\n" +
                "2. Provide 2 distinct, simple sensory choices for what to do next.\n" +
                "3. Return strictly valid JSON with keys: \"chapterTitle\", \"chapterNarrative\", \"sensoryAtmosphere\", \"storyEmoji\", \"choices\" (array of { \"id\", \"label\", \"emoji\" }).",
                chapter, patientName, theme, placesSummary, choice
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            List<AiStoryResponse.StoryChoice> choices = new ArrayList<>();
            if (node.has("choices") && node.get("choices").isArray()) {
                for (JsonNode c : node.get("choices")) {
                    choices.add(AiStoryResponse.StoryChoice.builder()
                            .id(c.path("id").asText("choice-" + UUID.randomUUID().toString().substring(0, 4)))
                            .label(c.path("label").asText("Continue walking peacefully"))
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
                    .chapterNarrative(node.path("chapterNarrative").asText("The morning sun illuminates the lush hills. A gentle breeze carries the soothing aroma of fresh tea leaves and flowering orchids."))
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
        Patient patient = resolvePatient(request.getPatientId());
        String patientName = patient != null ? patient.getName() : "Pratima Borah";
        String lang = patient != null && patient.getPreferredLanguage() != null ? patient.getPreferredLanguage() : "English";
        String market = request.getMarketName() != null ? request.getMarketName() : "Guwahati Fancy Bazaar";
        String item = request.getCurrentItem() != null ? request.getCurrentItem() : "Assam Golden Tips CTC Tea";
        int budget = request.getBudgetRemaining() != null ? request.getBudgetRemaining() : 200;
        String userMsg = request.getUserSpokenMessage() != null ? request.getUserSpokenMessage() : "How much for this fresh tea?";

        String prompt = String.format(
                "You are a friendly, courteous local shopkeeper at %s in North East India talking to customer %s in %s.\n" +
                "Item: %s. Customer's Remaining Budget: %d rupees.\n" +
                "Customer says: \"%s\".\n\n" +
                "INSTRUCTIONS:\n" +
                "1. Respond in 2 warm, respectful sentences as the merchant, proposing a fair price between 30 and 80 rupees.\n" +
                "2. Provide 2 quick response options for the customer.\n" +
                "3. Include a short cultural fact about the item from Assam or North East India.\n" +
                "4. Return strictly valid JSON with keys: \"merchantName\", \"merchantDialogue\", \"itemName\", \"finalPrice\" (integer), \"quickOptions\" (array of 2 strings), \"isDealClosed\" (boolean), \"culturalFact\".",
                market, patientName, lang, item, budget, userMsg
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            String merchant = node.has("merchantName") ? node.get("merchantName").asText() : "Deka Shopkeeper";
            String dialogue = node.has("merchantDialogue") ? node.get("merchantDialogue").asText() : "";
            int price = node.has("finalPrice") ? node.get("finalPrice").asInt(50) : 50;
            boolean dealClosed = node.has("isDealClosed") && node.get("isDealClosed").asBoolean();
            String fact = node.has("culturalFact") ? node.get("culturalFact").asText() : "Authentic organic harvest from Upper Assam estates.";

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
     * 5. THE HERITAGE PROVERBS: Folk Wisdom
     */
    public AiProverbResponse generateProverbChallenge(AiProverbRequest request) {
        String category = request.getCategory() != null ? request.getCategory() : "Bihu & Harvest";
        String prompt = String.format(
                "Generate a gentle North East Indian traditional proverb or folk saying challenge for category \"%s\".\n" +
                "Provide a partial verse with a single missing blank word, the correct missing word, and 2 incorrect distractors.\n" +
                "Include a simple, heartwarming explanation of its traditional wisdom.\n" +
                "Return strictly valid JSON with keys: \"partialVerseWithBlank\", \"correctWord\", \"candidateOptions\" (array of 3 words), \"fullProverb\", \"explanationAndWisdom\", \"regionOrigin\".",
                category
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            String verse = node.path("partialVerseWithBlank").asText("Bihu marks the arrival of spring and _____ in every home.");
            String correct = node.path("correctWord").asText("Joy");
            String full = node.path("fullProverb").asText("Bihu marks the arrival of spring and joy in every home.");
            String wisdom = node.path("explanationAndWisdom").asText("Rongali Bihu represents the joy of new beginnings, planting season, and harvest celebration.");
            String origin = node.path("regionOrigin").asText("Assam Folk Tradition");

            List<String> candidates = new ArrayList<>();
            if (node.has("candidateOptions") && node.get("candidateOptions").isArray()) {
                for (JsonNode opt : node.get("candidateOptions")) {
                    candidates.add(opt.asText());
                }
            }
            if (candidates.isEmpty() || !candidates.contains(correct)) {
                candidates = List.of(correct, "Frost", "Rain");
            }

            return AiProverbResponse.builder()
                    .id(UUID.randomUUID().toString())
                    .category(category)
                    .partialVerseWithBlank(verse)
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

    /**
     * 6. THE LIVING MEMOIR SCRIBE: Narrative Synthesizer & Lexical Analysis
     */
    public AiMemoirResponse generateMemoirStory(AiMemoirRequest request) {
        Patient patient = resolvePatient(request.getPatientId());
        String patientName = patient != null ? patient.getName() : "Pratima Borah";
        String promptTitle = request.getPhotoPromptTitle() != null ? request.getPhotoPromptTitle() : "Family Garden Memory";
        String speechText = request.getUserSpokenNarrative() != null ? request.getUserSpokenNarrative() : "We used to sit under the mango tree every Sunday morning.";

        LifeStory story = patient != null ? lifeStoryRepository.findByPatientId(patient.getId()).orElse(null) : null;
        String pastContext = story != null ? (story.getOccupation() + ", " + story.getHobbies()) : "Devoted family elder";

        String prompt = String.format(
                "You are an empathetic biographic memoirist honoring %s (%s) from North East India.\n" +
                "They shared this spoken memory about \"%s\": \"%s\".\n\n" +
                "INSTRUCTIONS:\n" +
                "1. Craft an evocative, elegant 2-sentence poetic summary honoring their memory with dignity and emotional resonance.\n" +
                "2. Evaluate their syntactic & lexical richness score between 82 and 98.\n" +
                "3. Return strictly valid JSON with keys: \"memoirTitle\", \"poeticNarrative\", \"emotionalTone\", \"syntacticRichnessScore\" (integer), \"culturalDedication\".",
                patientName, pastContext, promptTitle, speechText
        );

        try {
            String jsonOutput = callOllama(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);
            String title = node.has("memoirTitle") ? node.get("memoirTitle").asText() : promptTitle;
            String narrative = node.has("poeticNarrative") ? node.get("poeticNarrative").asText() : speechText;
            String tone = node.has("emotionalTone") ? node.get("emotionalTone").asText() : "Nostalgic and Joyful";
            int richness = node.has("syntacticRichnessScore") ? node.get("syntacticRichnessScore").asInt(92) : 92;
            String dedication = node.has("culturalDedication") ? node.get("culturalDedication").asText() : "Preserved in the Digital Living Heritage Archive of North East India.";

            return AiMemoirResponse.builder()
                    .memoirTitle(title)
                    .poeticNarrative(narrative)
                    .emotionalTone(tone)
                    .syntacticRichnessScore(richness)
                    .culturalDedication(dedication)
                    .build();
        } catch (Exception e) {
            log.warn("Ollama memoir fallback triggered: {}", e.getMessage());
            return fallbackMemoirResponse(promptTitle, speechText);
        }
    }

    private String callOllamaChat(List<Map<String, String>> messages) throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("model", MODEL);
        req.put("messages", messages);
        req.put("format", "json");
        req.put("stream", false);
        req.put("options", Map.of(
                "temperature", 0.7,
                "top_p", 0.9,
                "repeat_penalty", 1.2,
                "num_predict", 120,
                "num_ctx", 2048
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);

        ResponseEntity<String> response = createRestTemplate().exchange(
                OLLAMA_CHAT_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.has("message") && root.get("message").has("content")) {
                return root.get("message").get("content").asText();
            }
        }
        throw new RuntimeException("Ollama chat status: " + response.getStatusCode());
    }

    private String callOllama(String prompt) throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("model", MODEL);
        req.put("prompt", prompt);
        req.put("format", "json");
        req.put("stream", false);
        req.put("options", Map.of(
                "temperature", 0.4,
                "top_p", 0.9,
                "repeat_penalty", 1.15,
                "num_predict", 250,
                "num_ctx", 2048
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

    private AiMemoirResponse fallbackMemoirResponse(String promptTitle, String speechText) {
        return AiMemoirResponse.builder()
                .memoirTitle("Sunlit Memories of " + promptTitle)
                .poeticNarrative("Golden moments of warmth and family devotion continue to bloom like eternal orchids along the riverbanks of time.")
                .emotionalTone("Tender Reminiscence")
                .syntacticRichnessScore(94)
                .culturalDedication("Dedicated to the timeless heritage of North East India.")
                .build();
    }
}
