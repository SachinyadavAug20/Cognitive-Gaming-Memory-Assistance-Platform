package com.cognicare.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cognicare.data.remote.GameSessionRequest
import com.cognicare.di.ServiceLocator
import com.cognicare.repository.GameSessionRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class GameSessionState(
    val isRecording: Boolean = false,
    val lastRecorded: Boolean? = null,
    val error: String? = null
)

class GameSessionViewModel : ViewModel() {

    private val repository: GameSessionRepository = ServiceLocator.provideGameSessionRepository()

    private val _state = MutableStateFlow(GameSessionState())
    val state: StateFlow<GameSessionState> = _state

    fun recordSession(patientId: Long, gameType: String, durationSeconds: Int, accuracy: Double, difficultyLevel: Int) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isRecording = true)
            repository.recordSession(
                patientId = patientId,
                request = GameSessionRequest(
                    patientId = patientId,
                    gameType = gameType,
                    durationSeconds = durationSeconds,
                    accuracyPercentage = accuracy,
                    difficultyLevel = difficultyLevel
                )
            ).fold(
                onSuccess = {
                    _state.value = _state.value.copy(isRecording = false, lastRecorded = true)
                },
                onFailure = { e ->
                    _state.value = _state.value.copy(isRecording = false, lastRecorded = false, error = e.message)
                }
            )
        }
    }

    fun clearRecordState() {
        _state.value = _state.value.copy(lastRecorded = null)
    }
}
