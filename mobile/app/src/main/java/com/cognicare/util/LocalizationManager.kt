package com.cognicare.util

import android.content.Context
import android.speech.tts.TextToSpeech
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject
import java.io.InputStream
import java.util.Locale

object LocalizationManager {

    private val translationsCache = mutableMapOf<String, Map<String, String>>()
    private val _currentLanguage = MutableStateFlow("en")
    val currentLanguage: StateFlow<String> = _currentLanguage

    private var appContext: Context? = null
    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    val availableLanguages = listOf(
        "en" to ("English" to "English"),
        "hi" to ("Hindi" to "हिन्दी"),
        "as" to ("Assamese" to "অসমীয়া"),
        "bn" to ("Bengali" to "বাংলা"),
        "mr" to ("Marathi" to "मराठी"),
        "ne" to ("Nepali" to "नेपाली"),
        "mni" to ("Manipuri" to "মৈতৈলোন্"),
        "brx" to ("Bodo" to "बर'"),
        "grt" to ("Garo" to "A·chik"),
        "kha" to ("Khasi" to "Khasi"),
        "lus" to ("Mizo" to "Mizo")
    )

    fun init(context: Context, defaultLang: String = "en") {
        appContext = context.applicationContext
        _currentLanguage.value = defaultLang
        loadLanguage(context, "en") // base fallback
        if (defaultLang != "en") {
            loadLanguage(context, defaultLang)
        }

        // Initialize Android TextToSpeech
        try {
            tts = TextToSpeech(context.applicationContext) { status ->
                if (status == TextToSpeech.SUCCESS) {
                    isTtsReady = true
                    updateTtsLocale(defaultLang)
                }
            }
        } catch (_: Exception) { }
    }

    fun setLanguage(lang: String) {
        val validLang = if (availableLanguages.any { it.first == lang }) lang else "en"
        _currentLanguage.value = validLang
        appContext?.let { loadLanguage(it, validLang) }
        updateTtsLocale(validLang)
    }

    private fun updateTtsLocale(lang: String) {
        if (!isTtsReady || tts == null) return
        val targetLocale = when (lang) {
            "hi" -> Locale("hi", "IN")
            "bn" -> Locale("bn", "IN")
            "mr" -> Locale("mr", "IN")
            "ne" -> Locale("ne", "NP")
            "as", "mni" -> Locale("bn", "IN") // Bengali script audio engine fallback
            "brx" -> Locale("hi", "IN") // Hindi engine fallback
            else -> Locale("en", "IN")
        }
        try {
            tts?.language = targetLocale
            tts?.setSpeechRate(0.85f)
            tts?.setPitch(1.0f)
        } catch (_: Exception) { }
    }

    fun speak(text: String) {
        if (!isTtsReady || tts == null) return
        try {
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "cognicare_tts_${System.currentTimeMillis()}")
        } catch (_: Exception) { }
    }

    fun stopSpeaking() {
        try {
            tts?.stop()
        } catch (_: Exception) { }
    }

    private fun loadLanguage(context: Context, lang: String) {
        if (translationsCache.containsKey(lang)) return

        try {
            val assetPath = "messages/$lang.json"
            val inputStream: InputStream = context.assets.open(assetPath)
            val jsonString = inputStream.bufferedReader().use { it.readText() }
            val jsonObject = JSONObject(jsonString)
            val flattened = mutableMapOf<String, String>()
            flattenJson("", jsonObject, flattened)
            translationsCache[lang] = flattened
        } catch (_: Exception) {
            // If specific lang fails, ensure empty map so it doesn't crash
            if (!translationsCache.containsKey(lang)) {
                translationsCache[lang] = emptyMap()
            }
        }
    }

    private fun flattenJson(prefix: String, jsonObject: JSONObject, out: MutableMap<String, String>) {
        val keys = jsonObject.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val fullKey = if (prefix.isEmpty()) key else "$prefix.$key"
            val value = jsonObject.opt(key)
            if (value is JSONObject) {
                flattenJson(fullKey, value, out)
            } else if (value != null) {
                out[fullKey] = value.toString()
            }
        }
    }

    fun t(key: String, vararg args: Pair<String, String>): String {
        val lang = _currentLanguage.value
        val langMap = translationsCache[lang]
        val enMap = translationsCache["en"]

        var raw = langMap?.get(key) ?: enMap?.get(key) ?: key

        // String replacements, e.g. {name} -> args
        for ((k, v) in args) {
            raw = raw.replace("{$k}", v)
        }
        return raw
    }

    fun getLanguageNativeName(code: String): String {
        return availableLanguages.find { it.first == code }?.second?.second
            ?: availableLanguages.find { it.first == code }?.second?.first
            ?: code
    }
}
