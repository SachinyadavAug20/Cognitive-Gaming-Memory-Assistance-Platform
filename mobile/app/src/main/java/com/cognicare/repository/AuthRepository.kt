package com.cognicare.repository

import com.cognicare.data.remote.*

class AuthRepository(private val api: CogniCareApi) {
    suspend fun kioskScan(qrData: String): Result<KioskScanResponse> {
        return try {
            val response = api.kioskScan(KioskScanRequest(qrData))
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Kiosk scan failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun kioskDemo(): Result<KioskScanResponse> {
        return try {
            val response = api.kioskDemo()
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Demo login failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
