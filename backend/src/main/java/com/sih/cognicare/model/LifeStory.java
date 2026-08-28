package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "life_stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LifeStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;

    private String occupation;

    private String favoriteMusic;

    @Column(columnDefinition = "TEXT")
    private String hobbies;

    @Column(columnDefinition = "TEXT")
    private String lifeEvents;
}
