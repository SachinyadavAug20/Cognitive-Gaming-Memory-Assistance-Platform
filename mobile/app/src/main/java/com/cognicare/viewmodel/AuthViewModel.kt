package com.cognicare.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cognicare.data.local.Patient
import com.cognicare.data.local.AppDatabase
import com.cognicare.di.ServiceLocator
import com.cognicare.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthState(
    val isLoggedIn: Boolean = false,
    val isDemoMode: Boolean = false,
    val patient: Patient? = null,
    val token: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository: AuthRepository = ServiceLocator.provideAuthRepository(application)
    private val db: AppDatabase = ServiceLocator.provideDatabase(application)
    private val tokenManager = ServiceLocator.provideTokenManager(application)

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

    init {
        if (tokenManager.isLoggedIn) {
            val patient = Patient(
                id = tokenManager.patientId,
                name = tokenManager.patientName,
                age = 0,
                gender = "",
                state = "",
                language = tokenManager.language
            )
            _authState.value = AuthState(
                isLoggedIn = true,
                patient = patient,
                token = tokenManager.token
            )
        }
    }

    fun kioskScan(qrData: String) {
        viewModelScope.launch {
            _authState.value = _authState.value.copy(isLoading = true, error = null)
            authRepository.kioskScan(qrData).fold(
                onSuccess = { response ->
                    val remote = response.patient
                    val localPatient = Patient(
                        id = remote.id,
                        name = remote.name,
                        age = 0,
                        gender = "",
                        state = "",
                        language = remote.languagePreference ?: "en"
                    )
                    db.patientDao().insertPatient(localPatient)
                    _authState.value = _authState.value.copy(
                        isLoggedIn = true,
                        isDemoMode = false,
                        patient = localPatient,
                        token = response.token,
                        isLoading = false
                    )
                },
                onFailure = { e ->
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        error = e.message ?: "Login failed"
                    )
                }
            )
        }
    }

    fun demoLogin() {
        viewModelScope.launch {
            _authState.value = _authState.value.copy(isLoading = true, error = null)
            authRepository.kioskDemo().fold(
                onSuccess = { response ->
                    val remote = response.patient
                    val localPatient = Patient(
                        id = remote.id,
                        name = remote.name,
                        age = 72,
                        gender = "Male",
                        state = "Assam",
                        language = remote.languagePreference ?: "as"
                    )
                    db.patientDao().insertPatient(localPatient)
                    _authState.value = _authState.value.copy(
                        isLoggedIn = true,
                        isDemoMode = true,
                        patient = localPatient,
                        token = response.token,
                        isLoading = false
                    )
                },
                onFailure = { e ->
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        error = e.message ?: "Demo login failed"
                    )
                }
            )
        }
    }

    fun demoLoginLocal() {
        demoLoginPatient(1L)
    }

    fun demoLoginPatient(patientId: Long = 1L) {
        val localPatient = when (patientId) {
            2L -> Patient(id = 2L, name = "Mary Nongrum", age = 68, gender = "Female", state = "Meghalaya", language = "kha")
            3L -> Patient(id = 3L, name = "Ibochouba Singh", age = 74, gender = "Male", state = "Manipur", language = "mni")
            4L -> Patient(id = 4L, name = "Lalhmingmawii Sailo", age = 70, gender = "Female", state = "Mizoram", language = "lus")
            5L -> Patient(id = 5L, name = "Kevichusa Angami", age = 76, gender = "Male", state = "Nagaland", language = "en")
            else -> Patient(id = 1L, name = "Biren Borah", age = 72, gender = "Male", state = "Assam", language = "as")
        }
        tokenManager.patientId = localPatient.id
        tokenManager.patientName = localPatient.name
        tokenManager.language = localPatient.language
        viewModelScope.launch {
            db.patientDao().insertPatient(localPatient)
        }
        _authState.value = _authState.value.copy(
            isLoggedIn = true,
            isDemoMode = true,
            patient = localPatient,
            token = null,
            isLoading = false
        )
    }

    fun logout() {
        authRepository.logout()
        _authState.value = AuthState()
    }

    fun clearError() {
        _authState.value = _authState.value.copy(error = null)
    }
}
