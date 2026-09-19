package com.cognicare.data.remote

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class TokenManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "cognicare_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    var token: String?
        get() = prefs.getString(KEY_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_TOKEN, value).apply()

    var patientId: Long
        get() = prefs.getLong(KEY_PATIENT_ID, -1L)
        set(value) = prefs.edit().putLong(KEY_PATIENT_ID, value).apply()

    var patientName: String
        get() = prefs.getString(KEY_PATIENT_NAME, "") ?: ""
        set(value) = prefs.edit().putString(KEY_PATIENT_NAME, value).apply()

    var language: String
        get() = prefs.getString(KEY_LANGUAGE, "en") ?: "en"
        set(value) = prefs.edit().putString(KEY_LANGUAGE, value).apply()

    val isLoggedIn: Boolean
        get() = token != null && patientId > 0

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_PATIENT_ID = "patient_id"
        private const val KEY_PATIENT_NAME = "patient_name"
        private const val KEY_LANGUAGE = "language"
    }
}
