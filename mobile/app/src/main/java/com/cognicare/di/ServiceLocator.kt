package com.cognicare.di

import android.app.Application
import com.cognicare.BuildConfig
import com.cognicare.data.local.AppDatabase
import com.cognicare.data.remote.CogniCareApi
import com.cognicare.data.remote.TokenManager
import com.cognicare.repository.*
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ServiceLocator {

    private var database: AppDatabase? = null
    private var api: CogniCareApi? = null
    private var tokenManager: TokenManager? = null
    private var authRepository: AuthRepository? = null
    private var patientRepository: PatientRepository? = null
    private var gameSessionRepository: GameSessionRepository? = null
    private var aiRepository: AiRepository? = null
    private var surveillanceRepository: SurveillanceRepository? = null
    private var adminRepository: AdminRepository? = null

    @Synchronized
    fun provideDatabase(context: Application): AppDatabase {
        return database ?: AppDatabase.getDatabase(context).also { database = it }
    }

    @Synchronized
    fun provideTokenManager(context: Application): TokenManager {
        return tokenManager ?: TokenManager(context).also { tokenManager = it }
    }

    @Synchronized
    fun provideApi(context: Application): CogniCareApi {
        return api ?: run {
            val tm = provideTokenManager(context)

            val authInterceptor = Interceptor { chain ->
                val original = chain.request()
                val token = tm.token
                val request = if (token != null) {
                    original.newBuilder()
                        .header("Authorization", "Bearer $token")
                        .build()
                } else {
                    original
                }
                chain.proceed(request)
            }

            val logging = HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                else HttpLoggingInterceptor.Level.NONE
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build()

            Retrofit.Builder()
                .baseUrl(BuildConfig.BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(CogniCareApi::class.java)
                .also { api = it }
        }
    }

    @Synchronized
    fun provideAuthRepository(context: Application): AuthRepository {
        return authRepository ?: AuthRepository(provideApi(context), provideTokenManager(context)).also { authRepository = it }
    }

    @Synchronized
    fun providePatientRepository(context: Application): PatientRepository {
        return patientRepository ?: PatientRepository(provideApi(context)).also { patientRepository = it }
    }

    @Synchronized
    fun provideGameSessionRepository(context: Application): GameSessionRepository {
        return gameSessionRepository ?: GameSessionRepository(provideApi(context)).also { gameSessionRepository = it }
    }

    @Synchronized
    fun provideAiRepository(context: Application): AiRepository {
        return aiRepository ?: AiRepository(provideApi(context)).also { aiRepository = it }
    }

    @Synchronized
    fun provideSurveillanceRepository(context: Application): SurveillanceRepository {
        return surveillanceRepository ?: SurveillanceRepository(provideApi(context)).also { surveillanceRepository = it }
    }

    @Synchronized
    fun provideAdminRepository(context: Application): AdminRepository {
        return adminRepository ?: AdminRepository(provideApi(context)).also { adminRepository = it }
    }

    // ViewModel factories
    fun provideAuthViewModelFactory(context: Application) = object : androidx.lifecycle.ViewModelProvider.Factory {
        override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return com.cognicare.viewmodel.AuthViewModel(context) as T
        }
    }

    fun provideDashboardViewModelFactory(context: Application) = object : androidx.lifecycle.ViewModelProvider.Factory {
        override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return com.cognicare.viewmodel.DashboardViewModel(context) as T
        }
    }

    fun provideAiChatViewModelFactory(context: Application) = object : androidx.lifecycle.ViewModelProvider.Factory {
        override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return com.cognicare.viewmodel.AiChatViewModel(context) as T
        }
    }

    fun provideGameSessionViewModelFactory(context: Application) = object : androidx.lifecycle.ViewModelProvider.Factory {
        override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return com.cognicare.viewmodel.GameSessionViewModel(context) as T
        }
    }

    fun provideCaregiverViewModelFactory(context: Application) = object : androidx.lifecycle.ViewModelProvider.Factory {
        override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return com.cognicare.viewmodel.CaregiverViewModel(
                context,
                provideSurveillanceRepository(context)
            ) as T
        }
    }
}
