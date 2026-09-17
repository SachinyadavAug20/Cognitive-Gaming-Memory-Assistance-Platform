package com.cognicare.data.remote

import com.google.gson.annotations.SerializedName

data class GameSessionRequest(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("gameType") val gameType: String,
    @SerializedName("durationSeconds") val durationSeconds: Int? = null,
    @SerializedName("accuracyPercentage") val accuracyPercentage: Double? = null,
    @SerializedName("spatialRecallScore") val spatialRecallScore: Int? = null,
    @SerializedName("motorReactionTimeMs") val motorReactionTimeMs: Int? = null,
    @SerializedName("hesitationCount") val hesitationCount: Int? = null,
    @SerializedName("difficultyLevel") val difficultyLevel: Int? = null
)

data class GameSessionResponse(
    @SerializedName("id") val id: Long,
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("gameType") val gameType: String,
    @SerializedName("durationSeconds") val durationSeconds: Int?,
    @SerializedName("accuracyPercentage") val accuracyPercentage: Double?,
    @SerializedName("spatialRecallScore") val spatialRecallScore: Int?,
    @SerializedName("motorReactionTimeMs") val motorReactionTimeMs: Int?,
    @SerializedName("hesitationCount") val hesitationCount: Int?,
    @SerializedName("difficultyLevel") val difficultyLevel: Int?,
    @SerializedName("timestamp") val timestamp: String?
)

data class GameSessionStatsResponse(
    @SerializedName("totalSessions") val totalSessions: Int,
    @SerializedName("averageAccuracy") val averageAccuracy: Double,
    @SerializedName("averageMotorLatencyMs") val averageMotorLatencyMs: Double,
    @SerializedName("averageSpatialRecall") val averageSpatialRecall: Double,
    @SerializedName("recentSessions") val recentSessions: List<GameSessionResponse>,
    @SerializedName("aiClinicalSummary") val aiClinicalSummary: String?
)
