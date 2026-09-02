package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String gameType; // MAJULI_WALK, TEA_HARVEST, BIHU_DHOL, MEMORY_PIECES, ARROW_ESCAPE

    private Integer durationSeconds;

    private Double accuracyPercentage;

    private Integer spatialRecallScore;

    private Integer motorReactionTimeMs;

    private Integer hesitationCount;

    private Integer difficultyLevel;

    @CreationTimestamp
    private LocalDateTime timestamp;
}
