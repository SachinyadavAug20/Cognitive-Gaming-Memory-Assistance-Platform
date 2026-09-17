package com.cognicare.viewmodel

import android.app.Application
import android.location.Location
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cognicare.data.remote.CaregiverSosDto
import com.cognicare.di.ServiceLocator
import com.cognicare.repository.SurveillanceRepository
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Tasks
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class CaregiverState(
    val latestSos: CaregiverSosDto? = null,
    val isSendingSos: Boolean = false,
    val sosSent: Boolean = false,
    val currentLocation: Location? = null,
    val error: String? = null
)

class CaregiverViewModel(
    application: Application,
    private val repository: SurveillanceRepository
) : AndroidViewModel(application) {

    private val _state = MutableStateFlow(CaregiverState())
    val state: StateFlow<CaregiverState> = _state

    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(application)

    fun loadLatestSos(patientId: Long) {
        viewModelScope.launch {
            repository.getLatestSos(patientId).fold(
                onSuccess = { _state.value = _state.value.copy(latestSos = it) },
                onFailure = { _state.value = _state.value.copy(error = it.message) }
            )
        }
    }

    @Suppress("MissingPermission")
    fun sendSos(patientId: Long, locationLabel: String = "Patient location") {
        viewModelScope.launch {
            _state.value = _state.value.copy(isSendingSos = true)
            try {
                val location: Location? = try {
                    Tasks.await(fusedLocationClient.lastLocation)
                } catch (_: Exception) { null }

                val lat = location?.latitude ?: 0.0
                val lng = location?.longitude ?: 0.0

                repository.processSos(
                    patientId = patientId,
                    sos = CaregiverSosDto(
                        id = 0,
                        patientId = patientId,
                        patientLat = lat,
                        patientLng = lng,
                        locationLabel = locationLabel,
                        status = "PENDING"
                    )
                ).fold(
                    onSuccess = {
                        _state.value = _state.value.copy(isSendingSos = false, sosSent = true, latestSos = it)
                    },
                    onFailure = { e ->
                        _state.value = _state.value.copy(isSendingSos = false, error = e.message)
                    }
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(isSendingSos = false, error = "Location unavailable")
            }
        }
    }

    fun clearError() {
        _state.value = _state.value.copy(error = null)
    }
}
