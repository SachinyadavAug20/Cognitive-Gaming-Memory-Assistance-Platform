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

    private val authRepository: AuthRepository = ServiceLocator.provideAuthRepository()
    private val db: AppDatabase = ServiceLocator.provideDatabase(application)

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

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
        val localPatient = Patient(
            id = 2,
            name = "Biren Borah",
            age = 72,
            gender = "Male",
            state = "Assam",
            language = "as"
        )
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
        _authState.value = AuthState()
    }

    fun clearError() {
        _authState.value = _authState.value.copy(error = null)
    }
}
