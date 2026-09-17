package com.cognicare.repository

import com.cognicare.data.remote.*

class GameSessionRepository(private val api: CogniCareApi) {
    suspend fun recordSession(patientId: Long, request: GameSessionRequest): Result<GameSessionResponse> {
        return try {
            val response = api.recordGameSession(patientId, request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to record session: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getStats(patientId: Long): Result<GameSessionStatsResponse> {
        return try {
            val response = api.getGameSessionStats(patientId)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to fetch stats: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
