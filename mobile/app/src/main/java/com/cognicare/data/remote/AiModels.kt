package com.cognicare.data.remote

import com.google.gson.annotations.SerializedName

data class AiChatRequest(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("userMessage") val userMessage: String,
    @SerializedName("personaName") val personaName: String?,
    @SerializedName("conversationHistory") val conversationHistory: List<ChatMessage>?
)

data class ChatMessage(
    @SerializedName("role") val role: String,
    @SerializedName("text") val text: String
)

data class AiChatResponse(
    @SerializedName("replyText") val replyText: String,
    @SerializedName("spokenAudioText") val spokenAudioText: String?,
    @SerializedName("emotionTone") val emotionTone: String?,
    @SerializedName("suggestedQuickReplies") val suggestedQuickReplies: List<String>,
    @SerializedName("highlightedMemoryNote") val highlightedMemoryNote: String?,
    @SerializedName("relatedPhotoUrl") val relatedPhotoUrl: String?
)

data class AiCluesRequest(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("targetType") val targetType: String,
    @SerializedName("targetName") val targetName: String,
    @SerializedName("targetRelationOrSignificance") val targetRelationOrSignificance: String?,
    @SerializedName("targetNotes") val targetNotes: String?
)

data class AiCluesResponse(
    @SerializedName("gentleClue1") val gentleClue1: String,
    @SerializedName("specificClue2") val specificClue2: String,
    @SerializedName("directClue3") val directClue3: String,
    @SerializedName("encouragingEncouragement") val encouragingEncouragement: String,
    @SerializedName("candidateOptions") val candidateOptions: List<String>
)

data class AiStoryRequest(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("theme") val theme: String,
    @SerializedName("currentChapterIndex") val currentChapterIndex: Int,
    @SerializedName("previousChoiceMade") val previousChoiceMade: String?,
    @SerializedName("previousChapterSummaries") val previousChapterSummaries: List<String>?
)

data class AiStoryResponse(
    @SerializedName("chapterNumber") val chapterNumber: Int,
    @SerializedName("chapterTitle") val chapterTitle: String,
    @SerializedName("chapterNarrative") val chapterNarrative: String,
    @SerializedName("sensoryAtmosphere") val sensoryAtmosphere: String?,
    @SerializedName("storyEmoji") val storyEmoji: String?,
    @SerializedName("choices") val choices: List<StoryChoice>,
    @SerializedName("isFinale") val isFinale: Boolean
)

data class StoryChoice(
    @SerializedName("id") val id: String,
    @SerializedName("label") val label: String,
    @SerializedName("emoji") val emoji: String?,
    @SerializedName("nextThemePrompt") val nextThemePrompt: String?
)

data class AiBazaarRequest(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("marketName") val marketName: String,
    @SerializedName("currentItem") val currentItem: String,
    @SerializedName("userOfferPrice") val userOfferPrice: Int?,
    @SerializedName("userSpokenMessage") val userSpokenMessage: String?,
    @SerializedName("budgetRemaining") val budgetRemaining: Int
)

data class AiBazaarResponse(
    @SerializedName("merchantName") val merchantName: String,
    @SerializedName("merchantDialogue") val merchantDialogue: String,
    @SerializedName("itemName") val itemName: String,
    @SerializedName("finalPrice") val finalPrice: Int,
    @SerializedName("updatedBudget") val updatedBudget: Int,
    @SerializedName("quickOptions") val quickOptions: List<String>,
    @SerializedName("isDealClosed") val isDealClosed: Boolean,
    @SerializedName("culturalFact") val culturalFact: String?
)

data class AiProverbRequest(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("language") val language: String,
    @SerializedName("category") val category: String?
)

data class AiProverbResponse(
    @SerializedName("id") val id: String,
    @SerializedName("category") val category: String?,
    @SerializedName("partialVerseWithBlank") val partialVerseWithBlank: String,
    @SerializedName("correctWord") val correctWord: String,
    @SerializedName("candidateOptions") val candidateOptions: List<String>,
    @SerializedName("fullProverb") val fullProverb: String,
    @SerializedName("explanationAndWisdom") val explanationAndWisdom: String,
    @SerializedName("regionOrigin") val regionOrigin: String?
)

data class AiMemoirRequest(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("photoPromptTitle") val photoPromptTitle: String?,
    @SerializedName("userSpokenNarrative") val userSpokenNarrative: String?
)

data class AiMemoirResponse(
    @SerializedName("memoirTitle") val memoirTitle: String,
    @SerializedName("poeticNarrative") val poeticNarrative: String,
    @SerializedName("emotionalTone") val emotionalTone: String?,
    @SerializedName("syntacticRichnessScore") val syntacticRichnessScore: Int?,
    @SerializedName("culturalDedication") val culturalDedication: String?
)
