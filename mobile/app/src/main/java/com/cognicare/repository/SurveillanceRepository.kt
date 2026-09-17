package com.cognicare.repository

import com.cognicare.data.remote.*

class SurveillanceRepository(private val api: CogniCareApi) {
    suspend fun recordReading(patientId: Long, request: SurveillanceReadingRequest): Result<SurveillanceReadingDto> {
        return try {
            val response = api.recordSurveillanceReading(patientId, request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to record reading: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun processSos(patientId: Long, sos: CaregiverSosDto): Result<CaregiverSosDto> {
        return try {
            val response = api.processSosRequest(patientId, sos)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("SOS failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

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
