package com.cognicare.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PatientDao {
    @Query("SELECT * FROM patients WHERE id = :id")
    suspend fun getPatientById(id: Long): Patient?

    @Query("SELECT * FROM patients LIMIT 1")
    suspend fun getFirstPatient(): Patient?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPatient(patient: Patient)
}

@Dao
interface GameScoreDao {
    @Query("SELECT * FROM game_scores WHERE patientId = :patientId ORDER BY timestamp DESC")
    fun getScoresForPatient(patientId: Long): Flow<List<GameScore>>

    @Insert
    suspend fun insertScore(score: GameScore)
}
