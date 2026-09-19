package com.cognicare.repository

import com.cognicare.data.remote.*
import com.cognicare.util.bodyAsResult

class AiRepository(private val api: CogniCareApi) {
    suspend fun chat(request: AiChatRequest): Result<AiChatResponse> =
        runCatching { api.aiChat(request).bodyAsResult().getOrThrow() }

    suspend fun getClues(request: AiCluesRequest): Result<AiCluesResponse> =
        runCatching { api.aiClues(request).bodyAsResult().getOrThrow() }

    suspend fun getStoryChapter(request: AiStoryRequest): Result<AiStoryResponse> =
        runCatching { api.aiStoryChapter(request).bodyAsResult().getOrThrow() }

    suspend fun getBazaarTurn(request: AiBazaarRequest): Result<AiBazaarResponse> =
        runCatching { api.aiBazaar(request).bodyAsResult().getOrThrow() }

    suspend fun getProverb(request: AiProverbRequest): Result<AiProverbResponse> =
        runCatching { api.aiProverb(request).bodyAsResult().getOrThrow() }

    suspend fun getMemoir(request: AiMemoirRequest): Result<AiMemoirResponse> =
        runCatching { api.aiMemoirScribe(request).bodyAsResult().getOrThrow() }
}
