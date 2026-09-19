package com.cognicare.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "cognicare_settings")

class SettingsDataStore(private val context: Context) {

    companion object {
        val FONT_SIZE = floatPreferencesKey("font_size")
        val LANGUAGE = stringPreferencesKey("language")
        val NIGHT_MODE = booleanPreferencesKey("night_mode")
        val READ_ALOUD = booleanPreferencesKey("read_aloud")
        val LAST_MOOD = stringPreferencesKey("last_mood")
        val MOOD_TIMESTAMP = longPreferencesKey("mood_timestamp")
        val ROUTINE_COMPLETED = stringSetPreferencesKey("routine_completed")
        val SOUND_ON = booleanPreferencesKey("sound_on")
    }

    val fontSize: Flow<Float> = context.dataStore.data.map { it[FONT_SIZE] ?: 18f }
    val language: Flow<String> = context.dataStore.data.map { it[LANGUAGE] ?: "en" }
    val nightMode: Flow<Boolean> = context.dataStore.data.map { it[NIGHT_MODE] ?: false }
    val readAloud: Flow<Boolean> = context.dataStore.data.map { it[READ_ALOUD] ?: false }
    val lastMood: Flow<String?> = context.dataStore.data.map { it[LAST_MOOD] }
    val moodTimestamp: Flow<Long> = context.dataStore.data.map { it[MOOD_TIMESTAMP] ?: 0L }
    val routineCompleted: Flow<Set<String>> = context.dataStore.data.map { it[ROUTINE_COMPLETED] ?: emptySet() }
    val soundOn: Flow<Boolean> = context.dataStore.data.map { it[SOUND_ON] ?: true }

    suspend fun setFontSize(size: Float) {
        context.dataStore.edit { it[FONT_SIZE] = size }
    }

    suspend fun setLanguage(lang: String) {
        context.dataStore.edit { it[LANGUAGE] = lang }
    }

    suspend fun setNightMode(enabled: Boolean) {
        context.dataStore.edit { it[NIGHT_MODE] = enabled }
    }

    suspend fun setReadAloud(enabled: Boolean) {
        context.dataStore.edit { it[READ_ALOUD] = enabled }
    }

    suspend fun setMood(mood: String) {
        context.dataStore.edit {
            it[LAST_MOOD] = mood
            it[MOOD_TIMESTAMP] = System.currentTimeMillis()
        }
    }

    suspend fun setRoutineCompleted(items: Set<String>) {
        context.dataStore.edit { it[ROUTINE_COMPLETED] = items }
    }

    suspend fun setSoundOn(on: Boolean) {
        context.dataStore.edit { it[SOUND_ON] = on }
    }
}
