package com.cognicare.repository

import com.cognicare.data.remote.*
import okhttp3.MultipartBody
import okhttp3.RequestBody

class PatientRepository(private val api: CogniCareApi) {
    suspend fun getPatients(): Result<List<PatientProfileResponse>> {
        return try {
            val response = api.getPatients()
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to fetch patients: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPatientDetail(id: Long): Result<PatientDetailResponse> {
        return try {
            val response = api.getPatientDetail(id)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to fetch patient: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPatientFamily(id: Long): Result<List<FamilyMemberResponse>> {
        return try {
            val response = api.getPatientFamily(id)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to fetch family: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPatientPlaces(id: Long): Result<List<FamiliarPlaceResponse>> {
        return try {
            val response = api.getPatientPlaces(id)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to fetch places: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPatientMedicalProfile(id: Long): Result<MedicalProfileResponse> {
        return try {
            val response = api.getPatientMedicalProfile(id)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to fetch medical profile: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun onboardPatient(
        data: RequestBody,
        reportFile: MultipartBody.Part? = null,
        photos: List<MultipartBody.Part>? = null
    ): Result<PatientOnboardResponse> {
        return try {
            val response = api.onboardPatient(data, reportFile, photos)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("Failed to onboard: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
