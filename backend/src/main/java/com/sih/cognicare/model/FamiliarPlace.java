package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "familiar_places")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamiliarPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String photoPath;

    private String emoji;
}
