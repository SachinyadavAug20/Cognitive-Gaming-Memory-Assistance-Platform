package com.cognicare.data.remote

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface CogniCareApi {

    // ── Health ──────────────────────────────────────────────────
    @GET("/api/v1/health")
    suspend fun getHealth(): Response<HealthResponse>

    // ── Kiosk Auth ──────────────────────────────────────────────
    @POST("/api/v1/auth/kiosk/scan")
    suspend fun kioskScan(@Body request: KioskScanRequest): Response<KioskScanResponse>

    @POST("/api/v1/auth/kiosk/demo")
    suspend fun kioskDemo(): Response<KioskScanResponse>

    // ── Patients ────────────────────────────────────────────────
    @Multipart
    @POST("/api/v1/patients/onboard")
    suspend fun onboardPatient(
        @Part("data") data: RequestBody,
        @Part reportFile: MultipartBody.Part? = null,
        @Part photos: List<MultipartBody.Part>? = null
    ): Response<PatientOnboardResponse>

    @GET("/api/v1/patients")
    suspend fun getPatients(): Response<List<PatientProfileResponse>>

    @GET("/api/v1/patients/{id}")
    suspend fun getPatientDetail(@Path("id") id: Long): Response<PatientDetailResponse>

    @GET("/api/v1/patients/{id}/family")
    suspend fun getPatientFamily(@Path("id") id: Long): Response<List<FamilyMemberResponse>>

    @GET("/api/v1/patients/{id}/places")
    suspend fun getPatientPlaces(@Path("id") id: Long): Response<List<FamiliarPlaceResponse>>

    @GET("/api/v1/patients/{id}/medical-profile")
    suspend fun getPatientMedicalProfile(@Path("id") id: Long): Response<MedicalProfileResponse>

    @Multipart
    @POST("/api/v1/patients/analyze-pdf")
    suspend fun analyzePdf(
        @Part reportFile: MultipartBody.Part
    ): Response<MedicalProfileResponse>

    // ── Game Sessions ───────────────────────────────────────────
    @POST("/api/v1/patients/{id}/sessions")
    suspend fun recordGameSession(
        @Path("id") id: Long,
        @Body request: GameSessionRequest
    ): Response<GameSessionResponse>

    @GET("/api/v1/patients/{id}/sessions/stats")
    suspend fun getGameSessionStats(@Path("id") id: Long): Response<GameSessionStatsResponse>

    // ── Caregiver Card ──────────────────────────────────────────
    @GET("/api/v1/caregiver/patients/{patientId}/card")
    suspend fun getPatientCard(@Path("patientId") patientId: Long): Response<GenerateCardResponse>

    @POST("/api/v1/caregiver/patients/{patientId}/card")
    suspend fun generatePatientCard(@Path("patientId") patientId: Long): Response<GenerateCardResponse>

    // ── AI Reminiscence ─────────────────────────────────────────
    @POST("/api/v1/ai/reminiscence/chat")
    suspend fun aiChat(@Body request: AiChatRequest): Response<AiChatResponse>

    @POST("/api/v1/ai/reminiscence/clues")
    suspend fun aiClues(@Body request: AiCluesRequest): Response<AiCluesResponse>

    @POST("/api/v1/ai/reminiscence/story-chapter")
    suspend fun aiStoryChapter(@Body request: AiStoryRequest): Response<AiStoryResponse>

    @POST("/api/v1/ai/reminiscence/bazaar")
    suspend fun aiBazaar(@Body request: AiBazaarRequest): Response<AiBazaarResponse>

    @POST("/api/v1/ai/reminiscence/proverb")
    suspend fun aiProverb(@Body request: AiProverbRequest): Response<AiProverbResponse>

    @POST("/api/v1/ai/reminiscence/memoir-scribe")
    suspend fun aiMemoirScribe(@Body request: AiMemoirRequest): Response<AiMemoirResponse>

    // ── Surveillance ────────────────────────────────────────────
    @POST("/api/v1/surveillance/patients/{id}/readings")
    suspend fun recordSurveillanceReading(
        @Path("id") id: Long,
        @Body request: SurveillanceReadingRequest
    ): Response<SurveillanceReadingDto>

    @POST("/api/v1/surveillance/patients/{id}/alerts")
    suspend fun raiseSurveillanceAlert(
        @Path("id") id: Long,
        @Body alert: SurveillanceAlertDto
    ): Response<SurveillanceAlertDto>

    @POST("/api/v1/surveillance/patients/{id}/sos")
    suspend fun processSosRequest(
        @Path("id") id: Long,
        @Body sos: CaregiverSosDto
    ): Response<CaregiverSosDto>

    @GET("/api/v1/surveillance/patients/{id}/sos/latest")
    suspend fun getLatestSos(@Path("id") id: Long): Response<CaregiverSosDto>

    // ── Admin ───────────────────────────────────────────────────
    @GET("/api/v1/admin/overview")
    suspend fun getAdminOverview(): Response<AdminOverviewDto>

    @GET("/api/v1/admin/patients")
    suspend fun getAdminPatients(): Response<List<AdminPatientRowDto>>

    @POST("/api/v1/admin/cards/{patientId}/revoke")
    suspend fun revokeCard(@Path("patientId") patientId: Long): Response<Map<String, Any>>

    @POST("/api/v1/admin/cards/{patientId}/reissue")
    suspend fun reissueCard(@Path("patientId") patientId: Long): Response<GenerateCardResponse>

    @GET("/api/v1/admin/ai-models")
    suspend fun getAiDiagnostics(): Response<AdminAiDiagnosticsDto>

    @GET("/api/v1/admin/sessions/recent")
    suspend fun getRecentSessions(): Response<List<AdminSessionRowDto>>

    @GET("/api/v1/admin/ner-districts")
    suspend fun getNerDistricts(): Response<List<AdminDistrictHealthDto>>

    @GET("/api/v1/admin/offline-sync")
    suspend fun getOfflineSync(): Response<AdminOfflineQueueDto>

    @GET("/api/v1/admin/surveillance")
    suspend fun getEpidemiologicalSurveillance(): Response<List<AdminEpidemiologicalSurveillanceDto>>

    @GET("/api/v1/admin/asha-workers")
    suspend fun getAshaWorkers(): Response<List<AdminAshaWorkerDto>>

    @GET("/api/v1/admin/alerts")
    suspend fun getAlerts(): Response<List<AdminClinicalAlertDto>>

    @POST("/api/v1/admin/alerts/{id}/resolve")
    suspend fun resolveAlert(@Path("id") id: String): Response<Map<String, Any>>

    @GET("/api/v1/admin/ai-tuning")
    suspend fun getAiTuning(): Response<AdminAiTuningDto>

    @POST("/api/v1/admin/ai-tuning")
    suspend fun updateAiTuning(@Body body: AdminAiTuningDto): Response<AdminAiTuningDto>

    @GET("/api/v1/admin/tele-manas")
    suspend fun getTeleManas(): Response<List<AdminTeleManasConsultationDto>>

    @POST("/api/v1/admin/tele-manas/schedule")
    suspend fun scheduleTeleManas(
        @Body consultation: AdminTeleManasConsultationDto
    ): Response<AdminTeleManasConsultationDto>

    @GET("/api/v1/admin/medications")
    suspend fun getMedications(): Response<List<AdminMedicationAdherenceDto>>

    @POST("/api/v1/admin/medications/{id}/remind")
    suspend fun remindMedication(@Path("id") id: Long): Response<Map<String, Any>>

    @GET("/api/v1/admin/kiosk-fleet")
    suspend fun getKioskFleet(): Response<List<AdminKioskDeviceDto>>

    @GET("/api/v1/admin/cultural-assets")
    suspend fun getCulturalAssets(): Response<List<AdminCulturalAssetDto>>

    @POST("/api/v1/admin/cultural-assets")
    suspend fun addCulturalAsset(
        @Body asset: AdminCulturalAssetDto
    ): Response<AdminCulturalAssetDto>

    @GET("/api/v1/admin/audit-logs")
    suspend fun getAuditLogs(): Response<List<AdminAuditLogDto>>

    @GET("/api/v1/admin/asha-incentives")
    suspend fun getAshaIncentives(): Response<List<AdminAshaIncentiveDto>>

    @POST("/api/v1/admin/asha-incentives/{id}/approve")
    suspend fun approveAshaIncentive(@Path("id") id: String): Response<AdminAshaIncentiveDto>

    @GET("/api/v1/admin/predictive-trajectories")
    suspend fun getPredictiveTrajectories(): Response<List<AdminPredictiveTrajectoryDto>>

    @GET("/api/v1/admin/caregiver-burnout")
    suspend fun getCaregiverBurnout(): Response<List<AdminCaregiverBurnoutDto>>

    @GET("/api/v1/admin/emergency-broadcasts")
    suspend fun getEmergencyBroadcasts(): Response<List<AdminEmergencyBroadcastDto>>

    @POST("/api/v1/admin/emergency-broadcast")
    suspend fun dispatchEmergencyBroadcast(
        @Body broadcast: AdminEmergencyBroadcastDto
    ): Response<AdminEmergencyBroadcastDto>

    @GET("/api/v1/admin/kiosks")
    suspend fun getKioskStations(): Response<List<AdminKioskStationDto>>

    @GET("/api/v1/admin/export")
    suspend fun exportData(): Response<Map<String, Any>>
}
