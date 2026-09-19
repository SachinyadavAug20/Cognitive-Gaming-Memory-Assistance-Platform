package com.cognicare.util

import retrofit2.Response

fun <T> Response<T>.bodyAsResult(): Result<T> =
    if (isSuccessful) body()?.let { Result.success(it) }
        ?: Result.failure(Exception("Empty response body (HTTP ${code()})"))
    else Result.failure(Exception("HTTP ${code()}: ${message()}"))

fun <T> Response<T>.bodyOrNull(): T? = if (isSuccessful) body() else null
