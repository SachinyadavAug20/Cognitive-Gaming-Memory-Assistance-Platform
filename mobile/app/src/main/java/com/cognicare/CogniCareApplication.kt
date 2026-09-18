package com.cognicare

import android.app.Application
import com.cognicare.di.ServiceLocator
import com.cognicare.util.LocalizationManager

class CogniCareApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        val tokenManager = ServiceLocator.provideTokenManager(this)
        val savedLang = tokenManager.language.ifEmpty { "en" }
        LocalizationManager.init(this, savedLang)
    }
}
