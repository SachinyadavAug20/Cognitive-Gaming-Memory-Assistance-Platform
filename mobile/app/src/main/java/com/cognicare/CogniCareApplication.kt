package com.cognicare

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.disk.DiskCache
import coil.memory.MemoryCache
import com.cognicare.di.ServiceLocator
import com.cognicare.util.LocalizationManager

class CogniCareApplication : Application(), ImageLoaderFactory {

    override fun onCreate() {
        super.onCreate()
        val tokenManager = ServiceLocator.provideTokenManager(this)
        val savedLang = tokenManager.language.ifEmpty { "en" }
        LocalizationManager.init(this, savedLang)
    }

    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .memoryCache {
                MemoryCache.Builder(this)
                    .maxSizePercent(0.25)
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(cacheDir.resolve("image_cache"))
                    .maxSizePercent(0.02)
                    .build()
            }
            .crossfade(true)
            .build()
    }
}
