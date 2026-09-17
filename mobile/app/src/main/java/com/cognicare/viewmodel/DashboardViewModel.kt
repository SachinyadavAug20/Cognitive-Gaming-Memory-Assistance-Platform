package com.cognicare.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cognicare.data.remote.*
import com.cognicare.di.ServiceLocator
import com.cognicare.repository.PatientRepository
import com.cognicare.repository.GameSessionRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class DashboardState(
    val patientDetail: PatientDetailResponse? = null,
    val familyMembers: List<FamilyMemberResponse> = emptyList(),
    val familiarPlaces: List<FamiliarPlaceResponse> = emptyList(),
    val sessionStats: GameSessionStatsResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class DashboardViewModel : ViewModel() {

    private val patientRepository: PatientRepository = ServiceLocator.providePatientRepository()
    private val gameSessionRepository: GameSessionRepository = ServiceLocator.provideGameSessionRepository()

    private val _state = MutableStateFlow(DashboardState())
    val state: StateFlow<DashboardState> = _state

    fun loadDashboard(patientId: Long) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)

            val detail = patientRepository.getPatientDetail(patientId).getOrNull()
            val family = patientRepository.getPatientFamily(patientId).getOrNull()
            val places = patientRepository.getPatientPlaces(patientId).getOrNull()
            val stats = gameSessionRepository.getStats(patientId).getOrNull()

            _state.value = _state.value.copy(
                patientDetail = detail,
                familyMembers = family ?: emptyList(),
                familiarPlaces = places ?: emptyList(),
                sessionStats = stats,
                isLoading = false
            )
        }
    }

    fun refresh(patientId: Long) = loadDashboard(patientId)
}
