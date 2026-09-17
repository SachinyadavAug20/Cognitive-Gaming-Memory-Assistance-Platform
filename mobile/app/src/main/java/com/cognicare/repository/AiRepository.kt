package com.cognicare.repository

import com.cognicare.data.remote.*

class AiRepository(private val api: CogniCareApi) {
    suspend fun chat(request: AiChatRequest): Result<AiChatResponse> {
        return try {
            val response = api.aiChat(request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("AI chat failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getClues(request: AiCluesRequest): Result<AiCluesResponse> {
        return try {
            val response = api.aiClues(request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("AI clues failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getStoryChapter(request: AiStoryRequest): Result<AiStoryResponse> {
        return try {
            val response = api.aiStoryChapter(request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("AI story failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getBazaarTurn(request: AiBazaarRequest): Result<AiBazaarResponse> {
        return try {
            val response = api.aiBazaar(request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("AI bazaar failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProverb(request: AiProverbRequest): Result<AiProverbResponse> {
        return try {
            val response = api.aiProverb(request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("AI proverb failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMemoir(request: AiMemoirRequest): Result<AiMemoirResponse> {
        return try {
            val response = api.aiMemoirScribe(request)
            if (response.isSuccessful) Result.success(response.body()!!)
            else Result.failure(Exception("AI memoir failed: ${response.code()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
