package com.cognicare.data.local

import androidx.compose.runtime.Immutable
import androidx.room.Entity
import androidx.room.PrimaryKey

@Immutable
@Entity(tableName = "patients")
data class Patient(
    @PrimaryKey val id: Long,
    val name: String,
    val age: Int,
    val gender: String,
    val state: String,
    val photoUrl: String = "",
    val language: String = "en"
)

@Immutable
@Entity(tableName = "game_scores")
data class GameScore(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val patientId: Long,
    val gameId: String,
    val score: Int,
    val timestamp: Long = System.currentTimeMillis()
)
