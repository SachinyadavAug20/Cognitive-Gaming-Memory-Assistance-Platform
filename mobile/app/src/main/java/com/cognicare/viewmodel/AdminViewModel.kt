package com.cognicare.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cognicare.data.remote.*
import com.cognicare.di.ServiceLocator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AdminUiState(
    val isLoading: Boolean = true,
    val overview: AdminOverviewDto? = null,
    val patients: List<AdminPatientRowDto> = emptyList(),
    val sessions: List<AdminSessionRowDto> = emptyList(),
    val districts: List<AdminDistrictHealthDto> = emptyList(),
    val alerts: List<AdminClinicalAlertDto> = emptyList(),
    val aiDiagnostics: AdminAiDiagnosticsDto? = null,
    val selectedTab: Int = 0,
    val error: String? = null
)

class AdminViewModel(application: Application) : AndroidViewModel(application) {
    private val adminRepo = ServiceLocator.provideAdminRepository(application)

    private val _uiState = MutableStateFlow(AdminUiState())
    val uiState: StateFlow<AdminUiState> = _uiState.asStateFlow()

    init {
        loadAdminData()
    }

    fun selectTab(tab: Int) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }

    fun loadAdminData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val overview = adminRepo.getOverview().getOrNull()
                val patients = adminRepo.getPatients().getOrNull() ?: emptyList()
                val sessions = adminRepo.getRecentSessions().getOrNull() ?: emptyList()
                val districts = adminRepo.getNerDistricts().getOrNull() ?: emptyList()
                val alerts = adminRepo.getAlerts().getOrNull() ?: emptyList()
                val ai = adminRepo.getAiDiagnostics().getOrNull()

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    overview = overview,
                    patients = patients,
                    sessions = sessions,
                    districts = districts,
                    alerts = alerts,
                    aiDiagnostics = ai
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Could not connect to backend. Showing offline data."
                )
                loadOfflineData()
            }
        }
    }

    private fun loadOfflineData() {
        _uiState.value = _uiState.value.copy(
            overview = AdminOverviewDto(
                totalPatients = 5,
                activeCards = 5,
                totalSessions = 47,
                ollamaStatus = "offline",
                dbStatus = "h2-demo"
            ),
            patients = listOf(
                AdminPatientRowDto(1, "Biren Borah", "Male", "as", "9876543210", "2026-01-15", true, "demo-token"),
                AdminPatientRowDto(2, "Mary Nongrum", "Female", "kha", "9876543211", "2026-02-01", true, "demo-token"),
                AdminPatientRowDto(3, "Ibochouba Singh", "Male", "mni", "9876543212", "2026-02-15", true, "demo-token"),
                AdminPatientRowDto(4, "Lalhmingmawii Sailo", "Female", "lus", "9876543213", "2026-03-01", true, "demo-token"),
                AdminPatientRowDto(5, "Kevichusa Angami", "Male", "en", "9876543214", "2026-03-15", true, "demo-token")
            ),
            sessions = listOf(
                AdminSessionRowDto(1, 1, "Biren Borah", "memory_road", 300, 85.0, 420, 78, 2, 3, "2026-09-19T10:00:00"),
                AdminSessionRowDto(2, 2, "Mary Nongrum", "tea_garden", 240, 92.0, 380, 85, 1, 2, "2026-09-19T11:00:00"),
                AdminSessionRowDto(3, 3, "Ibochouba Singh", "temple_prayer", 180, 78.0, 510, 65, 4, 4, "2026-09-19T12:00:00")
            ),
            districts = listOf(
                AdminDistrictHealthDto("Assam", "Kamrup", 120, 45, 30, 15, 8, 0.82, "Azara PHC"),
                AdminDistrictHealthDto("Meghalaya", "East Khasi Hills", 85, 32, 22, 10, 5, 0.78, "Laitumkhrah PHC"),
                AdminDistrictHealthDto("Manipur", "Imphal West", 95, 38, 25, 12, 6, 0.85, "Uripok PHC"),
                AdminDistrictHealthDto("Mizoram", "Aizawl", 70, 28, 18, 8, 4, 0.90, "Zarkawt PHC"),
                AdminDistrictHealthDto("Nagaland", "Kohima", 65, 25, 16, 7, 3, 0.75, "Midland PHC")
            ),
            alerts = emptyList(),
            aiDiagnostics = AdminAiDiagnosticsDto("offline", "localhost:11434", 0, listOf("qwen2.5:1.5b"), "qwen2.5:1.5b", "Clinical Dementia Assistant")
        )
    }

    fun resolveAlert(alertId: String) {
        viewModelScope.launch {
            adminRepo.resolveAlert(alertId)
            loadAdminData()
        }
    }
}
