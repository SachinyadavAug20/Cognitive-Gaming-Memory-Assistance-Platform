package com.cognicare.repository

import com.cognicare.data.remote.*
import com.cognicare.util.bodyAsResult

class GameSessionRepository(private val api: CogniCareApi) {
    suspend fun recordSession(patientId: Long, request: GameSessionRequest): Result<GameSessionResponse> =
        runCatching { api.recordGameSession(patientId, request).bodyAsResult().getOrThrow() }

    suspend fun getStats(patientId: Long): Result<GameSessionStatsResponse> =
        runCatching { api.getGameSessionStats(patientId).bodyAsResult().getOrThrow() }
}
