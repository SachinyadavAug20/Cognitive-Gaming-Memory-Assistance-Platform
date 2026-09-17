package com.cognicare.data.remote

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("cognicare_prefs", Context.MODE_PRIVATE)

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
