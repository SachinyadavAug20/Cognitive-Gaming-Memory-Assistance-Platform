package com.cognicare.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cognicare.data.remote.*
import com.cognicare.di.ServiceLocator
import com.cognicare.repository.PatientRepository
import com.cognicare.repository.GameSessionRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineExceptionHandler

data class DashboardState(
    val patientDetail: PatientDetailResponse? = null,
    val familyMembers: List<FamilyMemberResponse> = emptyList(),
    val familiarPlaces: List<FamiliarPlaceResponse> = emptyList(),
    val sessionStats: GameSessionStatsResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class DashboardViewModel(application: Application) : AndroidViewModel(application) {

    private val patientRepository: PatientRepository = ServiceLocator.providePatientRepository(application)
    private val gameSessionRepository: GameSessionRepository = ServiceLocator.provideGameSessionRepository(application)

    private val _state = MutableStateFlow(DashboardState())
    val state: StateFlow<DashboardState> = _state

    private val exceptionHandler = CoroutineExceptionHandler { _, throwable ->
        _state.value = _state.value.copy(
            isLoading = false,
            error = "Could not load dashboard: ${throwable.message}"
        )
    }

    fun loadDashboard(patientId: Long) {
        viewModelScope.launch(exceptionHandler) {
            _state.value = _state.value.copy(isLoading = true, error = null)

            try {
                coroutineScope {
                    val detailDeferred = async { patientRepository.getPatientDetail(patientId).getOrNull() }
                    val familyDeferred = async { patientRepository.getPatientFamily(patientId).getOrNull() }
                    val placesDeferred = async { patientRepository.getPatientPlaces(patientId).getOrNull() }
                    val statsDeferred = async { gameSessionRepository.getStats(patientId).getOrNull() }

                    _state.value = _state.value.copy(
                        patientDetail = detailDeferred.await(),
                        familyMembers = familyDeferred.await() ?: emptyList(),
                        familiarPlaces = placesDeferred.await() ?: emptyList(),
                        sessionStats = statsDeferred.await(),
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = "Could not load dashboard data"
                )
            }
        }
    }

    fun refresh(patientId: Long) = loadDashboard(patientId)
}
