package com.cognicare.di

import android.app.Application
import com.cognicare.BuildConfig
import com.cognicare.data.local.AppDatabase
import com.cognicare.data.remote.CogniCareApi
import com.cognicare.repository.*
import com.cognicare.viewmodel.AuthViewModel
import com.cognicare.viewmodel.CaregiverViewModel
import com.cognicare.viewmodel.GameSessionViewModel
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ServiceLocator {

    private var database: AppDatabase? = null
    private var api: CogniCareApi? = null
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
    fun provideApi(): CogniCareApi {
        return api ?: run {
            val logging = HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                else HttpLoggingInterceptor.Level.NONE
            }
            val client = OkHttpClient.Builder()
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
    fun provideAuthRepository(): AuthRepository {
        return authRepository ?: AuthRepository(provideApi()).also { authRepository = it }
    }

    @Synchronized
    fun providePatientRepository(): PatientRepository {
        return patientRepository ?: PatientRepository(provideApi()).also { patientRepository = it }
    }

    @Synchronized
    fun provideGameSessionRepository(): GameSessionRepository {
        return gameSessionRepository ?: GameSessionRepository(provideApi()).also { gameSessionRepository = it }
    }

    @Synchronized
    fun provideAiRepository(): AiRepository {
        return aiRepository ?: AiRepository(provideApi()).also { aiRepository = it }
    }

    @Synchronized
    fun provideSurveillanceRepository(): SurveillanceRepository {
        return surveillanceRepository ?: SurveillanceRepository(provideApi()).also { surveillanceRepository = it }
    }

    @Synchronized
    fun provideAdminRepository(): AdminRepository {
        return adminRepository ?: AdminRepository(provideApi()).also { adminRepository = it }
    }

    fun provideAuthViewModel(application: Application): AuthViewModel {
        return AuthViewModel(application)
    }

    fun provideCaregiverViewModel(application: Application): CaregiverViewModel {
        return CaregiverViewModel(application, provideSurveillanceRepository())
    }

    fun provideGameSessionViewModel(): GameSessionViewModel {
        return GameSessionViewModel()
    }
}
