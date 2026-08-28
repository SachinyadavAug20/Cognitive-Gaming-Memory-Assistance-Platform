package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "family_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String name;

    private String relation;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String photoPath;
}
