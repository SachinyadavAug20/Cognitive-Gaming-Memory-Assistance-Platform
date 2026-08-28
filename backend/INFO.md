# CogniCare Backend — Technical Reference

> Quick revision doc for SIH26003 presentation. Covers architecture, stack, schema, API, and AI pipeline.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Name | CogniCare |
| Problem | SIH26003 — AI-Based Cognitive Gaming & Memory Assistance for Elderly Dementia Patients (NER India) |
| Backend Entry | `CognicareApplication.java` (`@SpringBootApplication`) |
| Base Package | `com.sih.cognicare` |
| Server Port | `8080` |
| API Prefix | `/api/v1` |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Spring Boot | 4.1.1 |
| Language | Java | 17 |
| Web Layer | Spring WebMVC | (starter) |
| ORM | Spring Data JPA / Hibernate | (starter) |
| Validation | Jakarta Bean Validation | (starter) |
| Build Tool | Apache Maven | 3.9.16 (via wrapper) |
| Primary DB | MariaDB | localhost:3306 |
| Demo DB | H2 (file-embedded) | — |
| PDF Extraction | Apache PDFBox | 3.0.3 |
| JSON Processing | Jackson (databind + jsr310) | — |
| Boilerplate | Lombok | — |
| AI Engine | Ollama (REST API) | qwen2.5:1.5b |
| API Style | REST / JSON / Multipart | — |

---

## 3. Package Architecture

```
com.sih.cognicare/
│
├── CognicareApplication.java              Spring Boot entry point
│
├── config/
│   ├── CorsConfig.java                    CORS filter — allows localhost:3000 on /api/**
│   ├── AppConfig.java                     ObjectMapper bean (JavaTimeModule, no timestamps)
│   └── WebConfig.java                     Static resource handler for /uploads/**
│
├── controller/
│   └── PatientController.java             All REST endpoints (onboard, getters, file serve)
│
├── dto/
│   ├── OnboardRequest.java                Inbound: nested JSON from frontend intake wizard
│   ├── PatientOnboardResponse.java        Outbound: patientId + medicalProfile + counts
│   ├── MedicalProfileResponse.java        Outbound: full clinical profile + SubscaleScoreDto
│   ├── DomainAssessment.java              Domain: needsHelp, impairmentLevel, scorePct, evidence
│   ├── FamilyMemberResponse.java          Outbound: family member + photo URL
│   └── FamiliarPlaceResponse.java         Outbound: place + emoji + photo URL
│
├── model/
│   ├── Patient.java                       Root entity — owns all children via @OneToMany/@OneToOne
│   ├── FamilyMember.java                  @ManyToOne → Patient (photo for Game 1)
│   ├── FamiliarPlace.java                 @ManyToOne → Patient (emoji + photo for Game 2)
│   ├── LifeStory.java                     @OneToOne → Patient (occupation, hobbies, life events JSON)
│   └── MedicalProfile.java                @OneToOne → Patient (clinical scores, Ollama output)
│
├── repository/
│   ├── PatientRepository.java             JpaRepository<Patient, Long> + findByCaregiverId
│   ├── FamilyMemberRepository.java        findByPatientId
│   ├── FamiliarPlaceRepository.java       findByPatientId
│   ├── LifeStoryRepository.java           findByPatientId
│   └── MedicalProfileRepository.java      findByPatientId
│
└── service/
    ├── FileStorageService.java            Disk I/O — saves photos/PDFs under ./uploads/patients/{id}/
    └── MedicalReportService.java          PDFBox extraction → Ollama qwen2.5:1.5b → JSON parse → persist
```

**File count:** 22 Java files (3 config, 1 controller, 6 DTOs, 5 entities, 5 repositories, 2 services)

---

## 4. Database Schema

**DDL strategy:** `spring.jpa.hibernate.ddl-auto=update` — schema auto-created/updated from `@Entity` classes.

### Table: `patients`
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT (PK, auto) | |
| `name` | VARCHAR | NOT NULL |
| `dob` | DATE | |
| `gender` | VARCHAR | |
| `phone` | VARCHAR | |
| `relationship` | VARCHAR | Caregiver's relation to patient |
| `caregiver_id` | BIGINT | FK (logical, not enforced) |
| `preferred_language` | VARCHAR | en/as/hi/mni |
| `cultural_background` | TEXT | |
| `joy_triggers` | TEXT | |
| `created_at` | TIMESTAMP | @CreationTimestamp |

### Table: `family_members`
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT (PK) | |
| `patient_id` | BIGINT (FK) | @ManyToOne → patients |
| `name` | VARCHAR | |
| `relation` | VARCHAR | Daughter, Son, Spouse, etc. |
| `notes` | TEXT | |
| `photo_path` | VARCHAR | Disk path for Game 1 photos |

### Table: `familiar_places`
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT (PK) | |
| `patient_id` | BIGINT (FK) | @ManyToOne → patients |
| `name` | VARCHAR | |
| `category` | VARCHAR | Emoji used as category |
| `description` | TEXT | |
| `photo_path` | VARCHAR | Disk path for Game 2 photos |
| `emoji` | VARCHAR | Visual landmark icon |

### Table: `life_stories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT (PK) | |
| `patient_id` | BIGINT (FK, UNIQUE) | @OneToOne → patients |
| `occupation` | VARCHAR | |
| `favorite_music` | VARCHAR | |
| `hobbies` | TEXT | Comma-separated |
| `life_events` | TEXT | JSON string: `[{event, year}]` |

### Table: `medical_profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT (PK) | |
| `patient_id` | BIGINT (FK, UNIQUE) | @OneToOne → patients |
| `raw_report_path` | VARCHAR | Path to uploaded PDF |
| `diagnosis` | VARCHAR | e.g. "Major Neurocognitive Disorder..." |
| `icd10` | VARCHAR | e.g. "G30.9 / F02.80" |
| `date_of_diagnosis` | VARCHAR | |
| `examining_physician` | VARCHAR | e.g. "Dr. Sarah Jenkins, MD" |
| `clinic_or_hospital` | VARCHAR | e.g. "St. Jude Medical Center" |
| `test_type` | VARCHAR | MMSE / MoCA / General Diagnostic / Unknown |
| `mmse_score` | INT | Total score (e.g. 19) |
| `max_score` | INT | Max possible (e.g. 30) |
| `clinical_stage` | VARCHAR | MCI / Early Dementia / Moderate / Severe |
| `recommended_start_difficulty` | INT | 1, 2, or 3 |
| `mta_score` | VARCHAR | MRI biomarker (e.g. "Grade 3") |
| `fazekas_grade` | VARCHAR | White matter biomarker (e.g. "Grade 1") |
| `llm_summary` | TEXT | Clinical summary from Ollama |
| `primary_deficits` | TEXT | Comma-separated domains |
| `impaired_domains` | TEXT | Comma-separated domains |
| `medications_json` | TEXT | Serialized `List<String>` |
| `clinical_domains_json` | TEXT | Serialized `Map<String, DomainAssessment>` |
| `subscale_scores_json` | TEXT | Serialized `Map<String, SubscaleScoreDto>` |
| `detailed_analysis_json` | TEXT | Complete raw Ollama JSON response |

**Relationships:**
```
Patient (1) ──→ (N) FamilyMember
Patient (1) ──→ (N) FamiliarPlace
Patient (1) ──→ (1) LifeStory
Patient (1) ──→ (1) MedicalProfile
```
All child tables use `cascade = ALL, orphanRemoval = true`.

---

## 5. REST API Endpoints

| # | Method | Endpoint | Content-Type | Description |
|---|--------|----------|-------------|-------------|
| 1 | `POST` | `/api/v1/patients/onboard` | `multipart/form-data` | Create patient + family + places + life story + medical analysis |
| 2 | `GET` | `/api/v1/patients/{id}/family` | `application/json` | Family members with photo URLs (Game 1 data) |
| 3 | `GET` | `/api/v1/patients/{id}/places` | `application/json` | Familiar places with photo URLs (Game 2 data) |
| 4 | `GET` | `/api/v1/patients/{id}/medical-profile` | `application/json` | Full clinical profile with 17-domain breakdown |
| 5 | `GET` | `/api/v1/uploads/{path}` | `application/octet-stream` | Static file serving (photos, PDFs) |
| 6 | — | `CORS` | — | GET/POST/PUT/DELETE/OPTIONS from `localhost:3000` on `/api/**` |

### Endpoint 1: `POST /patients/onboard` (Multipart)

**Request parts:**
| Part | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `application/json` (Blob) | Yes | Nested JSON: personal, relatives, lifeStory, landmarks, caregiverId |
| `reportFile` | `application/pdf` | No | Medical report PDF for Ollama analysis |
| `photos` | `image/*` (multiple) | No | Family/place photos, indexed to match JSON metadata |

**Response:** `PatientOnboardResponse`
```json
{
  "patientId": 1,
  "medicalProfile": { /* MedicalProfileResponse — full clinical data */ },
  "familyCount": 3,
  "placesCount": 4
}
```

### Endpoint 4: `GET /patients/{id}/medical-profile`

**Response:** `MedicalProfileResponse` with 17-domain quantified breakdown (see Section 6).

---

## 6. Ollama AI Pipeline

### Flow
```
PDF Upload → PDFBox Text Extraction → Ollama API → JSON Parse → Persist to MariaDB → Return to Frontend
```

### Configuration
| Setting | Value |
|---------|-------|
| Model | `qwen2.5:1.5b` (ultra-lightweight, 1.5B params) |
| Endpoint | `http://localhost:11434/api/generate` |
| Temperature | `0.1` (near-deterministic) |
| Format | `json` (strict JSON mode) |
| Stream | `false` (synchronous) |
| Connect Timeout | 10,000ms |
| Read Timeout | 10,000ms |
| Max Input Text | 8,000 characters (truncated from PDF) |

### Extraction Schema (17 Domains)
Ollama extracts quantified metrics for each domain:

```json
{
  "domain_name": {
    "needs_help": true,
    "impairment_level": "Severe | Moderate | Mild | None",
    "score_pct": 0-100,
    "evidence": "verbatim quote from clinical report"
  }
}
```

**Domain Categories:**

| Category | Domains |
|----------|---------|
| Cognitive (7) | memory, attention, executive_function, orientation, language, visuospatial, decision_making |
| IADLs (6) | medication_management, financial_management, navigation, meal_preparation, driving, household_tasks |
| Behavioral (4) | apathy, agitation, social_withdrawal, sleep_disturbance |

### Additional Extracted Fields
- `diagnosis`, `icd10`, `examiningPhysician`, `clinicOrHospital`
- `totalScore` / `maxScore` (e.g. 19/30 MMSE)
- `subscaleScores` (orientation, registration, attention_calculation, recall, language_visuospatial)
- `activeMedications[]`
- `mtaScore`, `fazekasGrade` (MRI biomarkers)
- `clinicalSummary`

### Graceful Fallbacks
| Scenario | Behavior |
|----------|----------|
| PDF text < 50 chars (scanned/image PDF) | Returns default Level 1 baseline, `llmSummary = "Scanned document detected..."` |
| Ollama offline or timeout (>10s) | Returns default Level 1 baseline, `llmSummary = "Ollama unavailable..."` |
| Invalid JSON from Ollama | Returns default Level 1 baseline, `llmSummary = "Analysis parsing failed..."` |
| No PDF uploaded (skipped step) | Returns default Level 1 baseline, `llmSummary = "No report uploaded..."` |

**Default baseline:** `clinicalStage=MCI`, `recommendedStartDifficulty=1`, all scores null, empty domains.

---

## 7. File Storage System

### Directory Structure
```
./uploads/
└── patients/
    └── {patientId}/
        ├── photos/          Family member + landmark photos
        │   ├── a1b2c3d4.jpg
        │   └── e5f6g7h8.png
        └── reports/         Medical report PDFs
            └── i9j0k1l2.pdf
```

### Implementation
- **Service:** `FileStorageService.java` — `saveFile(MultipartFile, patientId, subfolder)` → returns relative path
- **UUID naming:** Files renamed to `UUID.ext` to prevent conflicts
- **Serving:** `WebConfig.java` maps `/uploads/**` → `file:./uploads/` with CORS (GET from localhost:3000)
- **Max upload:** 10MB (`spring.servlet.multipart.max-file-size=10MB`)

---

## 8. Configuration Profiles

### Default Profile (MariaDB)
```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/cognicare?createDatabaseIfNotExist=true
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=root123
spring.jpa.hibernate.ddl-auto=update
```

### Demo Profile (H2 — zero setup)
```properties
spring.datasource.url=jdbc:h2:file:./data/cognicare;AUTO_SERVER=TRUE
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

| Property | Default | Demo |
|----------|---------|------|
| DB | MariaDB (port 3306) | H2 file (./data/cognicare) |
| DDL | `update` | `update` |
| Console | — | `/h2-console` |
| SQL logging | `show-sql=true` | `show-sql=false` |

---

## 9. Run Commands

```bash
# Pull AI model (one-time)
ollama pull qwen2.5:1.5b

# Start with MariaDB (default profile)
cd backend
./mvnw spring-boot:run

# Start with H2 (no DB needed)
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo

# Compile only
./mvnw compile
```

---

## 10. Key Dependencies (pom.xml)

| Dependency | Scope | Purpose |
|-----------|-------|---------|
| `spring-boot-starter-data-jpa` | compile | JPA/Hibernate ORM |
| `spring-boot-starter-validation` | compile | Bean validation |
| `spring-boot-starter-webmvc` | compile | REST API + web layer |
| `mariadb-java-client` | runtime | MariaDB JDBC driver |
| `postgresql` | runtime | PostgreSQL driver (alternative) |
| `h2` | runtime | H2 embedded database |
| `pdfbox` 3.0.3 | compile | PDF text extraction |
| `jackson-databind` | compile | JSON serialization |
| `jackson-datatype-jsr310` | compile | Java 8 date/time support |
| `lombok` | optional | @Getter/@Setter/@Builder boilerplate reduction |

---

*Last updated: August 2026*
