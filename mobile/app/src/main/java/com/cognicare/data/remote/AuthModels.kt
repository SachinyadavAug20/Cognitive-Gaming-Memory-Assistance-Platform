package com.cognicare.data.remote

import com.google.gson.annotations.SerializedName

data class KioskScanRequest(
    @SerializedName("qrData") val qrData: String
)

data class KioskScanResponse(
    @SerializedName("token") val token: String,
    @SerializedName("patient") val patient: PatientProfileResponse
)

data class PatientProfileResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("languagePreference") val languagePreference: String,
    @SerializedName("dob") val dob: String?
)

data class PatientOnboardResponse(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("medicalProfile") val medicalProfile: MedicalProfileResponse?,
    @SerializedName("familyCount") val familyCount: Int,
    @SerializedName("placesCount") val placesCount: Int
)

data class PatientDetailResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("dob") val dob: String?,
    @SerializedName("gender") val gender: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("relationship") val relationship: String?,
    @SerializedName("caregiverId") val caregiverId: Long?,
    @SerializedName("preferredLanguage") val preferredLanguage: String?,
    @SerializedName("culturalBackground") val culturalBackground: String?,
    @SerializedName("joyTriggers") val joyTriggers: String?,
    @SerializedName("createdAt") val createdAt: String?,
    @SerializedName("lifeStory") val lifeStory: LifeStoryDto?,
    @SerializedName("medicalProfile") val medicalProfile: MedicalProfileResponse?,
    @SerializedName("familyMembers") val familyMembers: List<FamilyMemberResponse>,
    @SerializedName("familiarPlaces") val familiarPlaces: List<FamiliarPlaceResponse>,
    @SerializedName("card") val card: GenerateCardResponse?
)

data class LifeStoryDto(
    @SerializedName("occupation") val occupation: String?,
    @SerializedName("favoriteMusic") val favoriteMusic: String?,
    @SerializedName("hobbies") val hobbies: List<String>,
    @SerializedName("lifeEvents") val lifeEvents: List<LifeEventDto>
)

data class LifeEventDto(
    @SerializedName("event") val event: String,
    @SerializedName("year") val year: String?,
    @SerializedName("photoUrl") val photoUrl: String?
)

data class FamilyMemberResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("relation") val relation: String?,
    @SerializedName("notes") val notes: String?,
    @SerializedName("photoUrl") val photoUrl: String?
)

data class FamiliarPlaceResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("emoji") val emoji: String?,
    @SerializedName("photoUrl") val photoUrl: String?
)

data class MedicalProfileResponse(
    @SerializedName("diagnosis") val diagnosis: String?,
    @SerializedName("icd10") val icd10: String?,
    @SerializedName("dateOfDiagnosis") val dateOfDiagnosis: String?,
    @SerializedName("examiningPhysician") val examiningPhysician: String?,
    @SerializedName("clinicOrHospital") val clinicOrHospital: String?,
    @SerializedName("clinicalStage") val clinicalStage: String?,
    @SerializedName("recommendedStartDifficulty") val recommendedStartDifficulty: Int?,
    @SerializedName("llmSummary") val llmSummary: String?,
    @SerializedName("testType") val testType: String?,
    @SerializedName("mmseScore") val mmseScore: Int?,
    @SerializedName("maxScore") val maxScore: Int?,
    @SerializedName("mtaScore") val mtaScore: String?,
    @SerializedName("fazekasGrade") val fazekasGrade: String?,
    @SerializedName("impairedDomains") val impairedDomains: String?,
    @SerializedName("primaryDeficits") val primaryDeficits: String?,
    @SerializedName("medications") val medications: List<String>,
    @SerializedName("subscaleScores") val subscaleScores: Map<String, SubscaleScoreDto>,
    @SerializedName("domains") val domains: Map<String, DomainAssessment>,
    @SerializedName("gameConfig") val gameConfig: GameConfigDto?
)

data class SubscaleScoreDto(
    @SerializedName("score") val score: Int,
    @SerializedName("max") val max: Int
)

data class DomainAssessment(
    @SerializedName("needs_help") val needsHelp: Boolean,
    @SerializedName("impairment_level") val impairmentLevel: String?,
    @SerializedName("score_pct") val scorePct: Int,
    @SerializedName("evidence") val evidence: String?
)

data class GameConfigDto(
    @SerializedName("startLevel") val startLevel: Int,
    @SerializedName("memoryGridSize") val memoryGridSize: Int,
    @SerializedName("memoryPreviewSeconds") val memoryPreviewSeconds: Int,
    @SerializedName("memoryShowHints") val memoryShowHints: Boolean,
    @SerializedName("wayfindingRouteLength") val wayfindingRouteLength: Int,
    @SerializedName("audioSpeechRate") val audioSpeechRate: Double
)

data class GenerateCardResponse(
    @SerializedName("secureToken") val secureToken: String,
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("patientName") val patientName: String,
    @SerializedName("issuedAt") val issuedAt: String,
    @SerializedName("isActive") val isActive: Boolean
)
