package com.cognicare.repository

import com.cognicare.data.remote.*
import com.cognicare.util.bodyAsResult

class SurveillanceRepository(private val api: CogniCareApi) {
    suspend fun recordReading(patientId: Long, request: SurveillanceReadingRequest): Result<SurveillanceReadingDto> =
        runCatching { api.recordSurveillanceReading(patientId, request).bodyAsResult().getOrThrow() }

    suspend fun processSos(patientId: Long, sos: CaregiverSosDto): Result<CaregiverSosDto> =
        runCatching { api.processSosRequest(patientId, sos).bodyAsResult().getOrThrow() }

    suspend fun getLatestSos(patientId: Long): Result<CaregiverSosDto?> {
        return try {
            val response = api.getLatestSos(patientId)
            if (response.isSuccessful) Result.success(response.body())
            else if (response.code() == 204) Result.success(null)
            else Result.failure(Exception("Failed to get SOS: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
