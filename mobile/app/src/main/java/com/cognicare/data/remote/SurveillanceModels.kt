package com.cognicare.data.remote

import com.google.gson.annotations.SerializedName

data class SurveillanceReadingRequest(
    @SerializedName("readingType") val readingType: String,
    @SerializedName("heartRateBpm") val heartRateBpm: Int? = null,
    @SerializedName("spo2Pct") val spo2Pct: Double? = null,
    @SerializedName("bodyTempC") val bodyTempC: Double? = null,
    @SerializedName("activityLevel") val activityLevel: String? = null,
    @SerializedName("steps") val steps: Int? = null,
    @SerializedName("sleepHours") val sleepHours: Double? = null,
    @SerializedName("hydrationGlasses") val hydrationGlasses: Int? = null,
    @SerializedName("latitude") val latitude: Double? = null,
    @SerializedName("longitude") val longitude: Double? = null,
    @SerializedName("geofenceStatus") val geofenceStatus: String? = null,
    @SerializedName("locationLabel") val locationLabel: String? = null,
    @SerializedName("deviceId") val deviceId: String? = null,
    @SerializedName("networkType") val networkType: String? = null,
    @SerializedName("syncStatus") val syncStatus: String? = null,
    @SerializedName("queuedPackets") val queuedPackets: Int? = null,
    @SerializedName("batteryPct") val batteryPct: Int? = null,
    @SerializedName("riskScore") val riskScore: Int? = null
)

data class SurveillanceReadingDto(
    @SerializedName("id") val id: Long,
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("recordedAt") val recordedAt: String,
    @SerializedName("readingType") val readingType: String,
    @SerializedName("heartRateBpm") val heartRateBpm: Int?,
    @SerializedName("spo2Pct") val spo2Pct: Double?,
    @SerializedName("bodyTempC") val bodyTempC: Double?,
    @SerializedName("activityLevel") val activityLevel: String?,
    @SerializedName("steps") val steps: Int?,
    @SerializedName("sleepHours") val sleepHours: Double?,
    @SerializedName("hydrationGlasses") val hydrationGlasses: Int?,
    @SerializedName("latitude") val latitude: Double?,
    @SerializedName("longitude") val longitude: Double?,
    @SerializedName("geofenceStatus") val geofenceStatus: String?,
    @SerializedName("locationLabel") val locationLabel: String?,
    @SerializedName("riskScore") val riskScore: Int?
)

data class SurveillanceAlertDto(
    @SerializedName("id") val id: Long,
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("alertType") val alertType: String,
    @SerializedName("severity") val severity: String,
    @SerializedName("message") val message: String?,
    @SerializedName("source") val source: String?,
    @SerializedName("resolved") val resolved: Boolean,
    @SerializedName("resolvedAt") val resolvedAt: String?,
    @SerializedName("assignedAsha") val assignedAsha: String?,
    @SerializedName("triggeredAt") val triggeredAt: String?
)

data class CaregiverSosDto(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("patientId") val patientId: Long = 0,
    @SerializedName("patientName") val patientName: String? = null,
    @SerializedName("patientLat") val patientLat: Double? = null,
    @SerializedName("patientLng") val patientLng: Double? = null,
    @SerializedName("locationLabel") val locationLabel: String? = null,
    @SerializedName("status") val status: String = "PENDING",
    @SerializedName("acknowledgedBy") val acknowledgedBy: String? = null,
    @SerializedName("requestedAt") val requestedAt: String? = null,
    @SerializedName("acknowledgedAt") val acknowledgedAt: String? = null
)

data class PatientSurveillanceDto(
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("gender") val gender: String?,
    @SerializedName("preferredLanguage") val preferredLanguage: String?,
    @SerializedName("district") val district: String?,
    @SerializedName("riskLevel") val riskLevel: String?,
    @SerializedName("riskScore") val riskScore: Int?,
    @SerializedName("heartRateBpm") val heartRateBpm: Int?,
    @SerializedName("spo2Pct") val spo2Pct: Double?,
    @SerializedName("bodyTempC") val bodyTempC: Double?,
    @SerializedName("activityLevel") val activityLevel: String?,
    @SerializedName("steps") val steps: Int?,
    @SerializedName("latitude") val latitude: Double?,
    @SerializedName("longitude") val longitude: Double?,
    @SerializedName("geofenceStatus") val geofenceStatus: String?,
    @SerializedName("openAlertCount") val openAlertCount: Long,
    @SerializedName("lastSeen") val lastSeen: String?
)
