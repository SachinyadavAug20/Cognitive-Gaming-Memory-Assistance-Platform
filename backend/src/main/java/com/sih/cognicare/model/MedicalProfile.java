package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medical_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false, unique = true)
    private Patient patient;

    private String rawReportPath;

    private String diagnosis;

    private String icd10;

    private String dateOfDiagnosis;

    private String examiningPhysician;

    private String clinicOrHospital;

    private String testType;

    private Integer mmseScore;

    private Integer maxScore;

    private String clinicalStage;

    private Integer recommendedStartDifficulty;

    private String mtaScore;

    private String fazekasGrade;

    @Column(columnDefinition = "TEXT")
    private String llmSummary;

    @Column(columnDefinition = "TEXT")
    private String primaryDeficits;

    @Column(columnDefinition = "TEXT")
    private String impairedDomains;

    @Column(columnDefinition = "TEXT")
    private String medicationsJson;

    @Column(columnDefinition = "TEXT")
    private String clinicalDomainsJson;

    @Column(columnDefinition = "TEXT")
    private String subscaleScoresJson;

    @Column(columnDefinition = "TEXT")
    private String detailedAnalysisJson;
}
