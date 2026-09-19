package com.cognicare.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cognicare.data.remote.AiChatRequest
import com.cognicare.data.remote.AiChatResponse
import com.cognicare.data.remote.ChatMessage
import com.cognicare.di.ServiceLocator
import com.cognicare.repository.AiRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AiChatState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val lastResponse: AiChatResponse? = null
)

class AiChatViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: AiRepository = ServiceLocator.provideAiRepository(application)

    private val _state = MutableStateFlow(AiChatState())
    val state: StateFlow<AiChatState> = _state

    fun sendMessage(patientId: Long, message: String, personaName: String = "Saathi") {
        viewModelScope.launch {
            val allMessages = _state.value.messages + ChatMessage(role = "user", text = message)
            val trimmedMessages = if (allMessages.size > 40) allMessages.takeLast(40) else allMessages
            val history = trimmedMessages.dropLast(1).map { ChatMessage(role = it.role, text = it.text) }

            _state.value = _state.value.copy(
                messages = trimmedMessages,
                isLoading = true,
                error = null
            )

            repository.chat(
                AiChatRequest(
                    patientId = patientId,
                    userMessage = message,
                    personaName = personaName,
                    conversationHistory = history
                )
            ).fold(
                onSuccess = { response ->
                    _state.value = _state.value.copy(
                        messages = _state.value.messages + ChatMessage(role = "assistant", text = response.replyText),
                        isLoading = false,
                        lastResponse = response
                    )
                },
                onFailure = { e ->
                    _state.value = _state.value.copy(
                        isLoading = false,
                        error = e.message ?: "AI unavailable"
                    )
                }
            )
        }
    }

    fun clearError() {
        _state.value = _state.value.copy(error = null)
    }
}
