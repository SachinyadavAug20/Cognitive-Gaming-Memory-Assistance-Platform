package com.cognicare.repository

import com.cognicare.data.remote.*
import com.cognicare.util.bodyAsResult
import okhttp3.MultipartBody
import okhttp3.RequestBody

class PatientRepository(private val api: CogniCareApi) {
    suspend fun getPatients(): Result<List<PatientProfileResponse>> =
        runCatching { api.getPatients().bodyAsResult().getOrThrow() }

    suspend fun getPatientDetail(id: Long): Result<PatientDetailResponse> =
        runCatching { api.getPatientDetail(id).bodyAsResult().getOrThrow() }

    suspend fun getPatientFamily(id: Long): Result<List<FamilyMemberResponse>> =
        runCatching { api.getPatientFamily(id).bodyAsResult().getOrThrow() }

    suspend fun getPatientPlaces(id: Long): Result<List<FamiliarPlaceResponse>> =
        runCatching { api.getPatientPlaces(id).bodyAsResult().getOrThrow() }

    suspend fun getPatientMedicalProfile(id: Long): Result<MedicalProfileResponse> =
        runCatching { api.getPatientMedicalProfile(id).bodyAsResult().getOrThrow() }

    suspend fun onboardPatient(
        data: RequestBody,
        reportFile: MultipartBody.Part? = null,
        photos: List<MultipartBody.Part>? = null
    ): Result<PatientOnboardResponse> =
        runCatching { api.onboardPatient(data, reportFile, photos).bodyAsResult().getOrThrow() }
}
