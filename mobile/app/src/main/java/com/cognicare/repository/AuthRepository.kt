package com.cognicare.repository

import com.cognicare.data.remote.*

class AuthRepository(
    private val api: CogniCareApi,
    private val tokenManager: TokenManager
) {
    suspend fun kioskScan(qrData: String): Result<KioskScanResponse> {
        return try {
            val response = api.kioskScan(KioskScanRequest(qrData))
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenManager.token = body.token
                tokenManager.patientId = body.patient.id
                tokenManager.patientName = body.patient.name
                body.patient.languagePreference?.let { tokenManager.language = it }
                Result.success(body)
            } else {
                Result.failure(Exception("Kiosk scan failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun kioskDemo(): Result<KioskScanResponse> {
        return try {
            val response = api.kioskDemo()
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenManager.token = body.token
                tokenManager.patientId = body.patient.id
                tokenManager.patientName = body.patient.name
                body.patient.languagePreference?.let { tokenManager.language = it }
                Result.success(body)
            } else {
                Result.failure(Exception("Demo login failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        tokenManager.clear()
    }
}
