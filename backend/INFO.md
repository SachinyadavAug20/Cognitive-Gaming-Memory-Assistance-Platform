# CogniCare Backend — Technical Reference

> **Factual engineering reference for the SIH 2026 CogniCare backend**  
> Spring Boot 4.1 • Java 17 • Spring Data JPA/Hibernate • Apache PDFBox 3.0.3 • hand-rolled HS256 JWT • Ollama

---

## 1. Project Identity & Build

| Field | Value |
|---|---|
| **System** | CogniCare Backend Service |
| **Coordinates** | `com.sih:cognicare:0.0.1-SNAPSHOT` |
| **Parent** | `spring-boot-starter-parent` **4.1.1** |
| **Runtime** | Java **17** |
| **Web starter** | `spring-boot-starter-webmvc` (± `-web`) |
| **Persistence** | `spring-boot-starter-data-jpa` (Hibernate) |
| **PDF** | Apache PDFBox **3.0.3** |
| **JWT** | **Hand-rolled HS256** — no `spring-boot-starter-security`, no JJWT |
| **Others** | `mariadb-java-client`, `postgresql`, `h2`, `jackson-databind` + `jackson-datatype-jsr310`, `lombok`, validation |
| **Port / base path** | `8080` • controllers pinned under `/api/v1` (no server context-path) |
| **Build** | `./mvnw -o compile` (offline wrapper) |

---

## 2. Configuration (Spring profiles)

There is **no dedicated "production" file** — `application.properties` is the default profile (MariaDB); `application-demo.properties` is the only named profile (H2).

### Default profile (`application.properties`) — MariaDB
- Datasource `jdbc:mariadb://localhost:3306/cognicare?createDatabaseIfNotExist=true`, driver `org.mariadb.jdbc.Driver`, user `root` / password `root123`.
- `spring.jpa.hibernate.ddl-auto=update`, `show-sql=true`.
- Multipart: `max-file-size=10MB`, `max-request-size=10MB`.
- `app.upload.dir=./uploads`.

### Demo profile (`application-demo.properties`) — H2
- `jdbc:h2:file:./data/cognicare;AUTO_SERVER=TRUE` (file-backed, not in-memory), user `sa`, empty password, `H2Dialect`, `ddl-auto=update`.
- H2 console at `/h2-console`.
- `app.upload.dir=./uploads`.

### Hardcoded engineering constants (not in properties)
- **JWT** (`JwtService`): secret `"cognicare-kiosk-secret-key-change-me"`, TTL **12 hours** (`12 * 60 * 60`). HS256, header `{alg,typ}`, payload `{sub:<id>, iat, exp}`, base64url, constant-time signature compare.
- **Ollama base URL** `http://localhost:11434` (hardcoded in `MedicalReportService`, `AdminController`, `GameSessionService`, `OllamaReminiscenceService`) — models `qwen2.5:1.5b` (clinical/session/reminiscence) and `llama3.2:3b` (admin diagnostics).
- **Demo patient** (`PatientCardService.DEMO_PATIENT_ID = 2L`).

---

## 3. Package & Layer Architecture

```
com.sih.cognicare/
├── CognicareApplication.java          # Spring Boot entry
├── config/
│   ├── CorsConfig.java                # CORS policy (localhost:3000 + LAN)
│   ├── AppConfig.java                 # ObjectMapper (JavaTimeModule)
│   └── WebConfig.java                 # /uploads/** static handler + interceptor registry
├── controller/                        # 7 REST controllers (see §5)
├── dto/                               # Request/response records (Onboard*, KioskScan*, etc.)
├── model/                             # 9 JPA entities (see §6)
├── repository/                        # 10 Spring Data repositories
├── service/                           # 7 services (see §7)
├── security/
│   └── JwtInterceptor.java            # JWT guard (fail-open, §8)
└── exception/
    ├── ApiError.java                  # { timestamp, status, error, message }
    ├── GlobalExceptionHandler.java    # Uniform error mapping
    └── *Exception.java                # PatientNotFoundException, InvalidQrTokenException, etc.
```

---

## 4. JWT & Auth Model

- **`JwtInterceptor`** (registered in `WebConfig`) applies only to the pattern **`/api/v1/patients/**`**.
- **Fail-open by design**: `OPTIONS` always pass; a request with **no `Authorization` header is allowed**; a present header that is not `Bearer ` → 401; an invalid/expired token → 401. (Fails open because live patient routes are still shared with the caregiver UI; intended to flip fail-closed later.)
- **`JwtService`** — generate/validate/expiry with a hand-rolled HS256 implementation (no external JWT library).

---

## 5. Controllers & REST Endpoints

### PatientController — base `/api/v1` (JWT pattern `/api/v1/patients/**`)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/patients/onboard` | Multipart onboarding: personal + family photos + landmarks + life story + optional medical PDF |
| GET | `/api/v1/patients` | List all patients |
| GET | `/api/v1/patients/{id}` | Full detail (life story, medical, family, places, active card) |
| GET | `/api/v1/patients/{id}/family` | Family members |
| GET | `/api/v1/patients/{id}/places` | Familiar places |
| GET | `/api/v1/patients/{id}/medical-profile` | Medical profile |
| POST | `/api/v1/patients/analyze-pdf` | Analyze a PDF only (no persist) |

### KioskAuthController — base `/api/v1/auth/kiosk`
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/kiosk/scan` | QR validation → JWT (`{ qrData }`; invalid/inactive → 401) |
| POST | `/api/v1/auth/kiosk/demo` | Demo login: returns JWT + patient **`id=2`** (Biren Borah, Assamese in the seeded DB) |

### CaregiverCardController — base `/api/v1/caregiver/patients`
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/caregiver/patients/{patientId}/card` | Return active card (or generate) |
| POST | `/api/v1/caregiver/patients/{patientId}/card` | Generate a new card |

### AdminController — each endpoint mapped to BOTH `/admin/...` and `/api/v1/admin/...` (`@CrossOrigin("*")`)
`GET /admin/overview`, `GET /admin/patients`, `POST /admin/cards/{id}/revoke`, `POST /admin/cards/{id}/reissue`, `GET /admin/ai-models` (Ollama tags), `GET /admin/sessions/recent`, `GET /admin/ner-districts`, `GET /admin/offline-sync`, `GET /admin/surveillance`, `GET /admin/asha-workers`, `GET /admin/alerts` + `POST /admin/alerts/{id}/resolve`, `GET/POST /admin/ai-tuning`, `GET /admin/tele-manas` + `POST /admin/tele-manas/schedule`, `GET /admin/medications` + `POST /admin/medications/{id}/remind`, `GET /admin/kiosk-fleet`, `GET/POST /admin/cultural-assets`, `GET /admin/audit-logs`, `GET /admin/asha-incentives` + `POST /admin/asha-incentives/{id}/approve`, `GET /admin/predictive-trajectories`, `GET /admin/caregiver-burnout`, `GET /admin/emergency-broadcasts` + `POST /admin/emergency-broadcast`, `GET /admin/kiosks`, `GET /admin/export`.
> Many admin endpoints serve **in-memory `ConcurrentHashMap` mission-control demo data** (alerts, tele-manas, cultural assets, audit logs, incentives, broadcasts) initialized in `initializeMissionControlData()` — not DB-backed.

### SurveillanceController — each endpoint mapped to BOTH `/surveillance/...` and `/api/v1/surveillance/...`
`POST /surveillance/patients/{id}/readings`, `POST /surveillance/patients/{id}/alerts`, `POST /surveillance/patients/{id}/sos`, `GET /surveillance/patients/{id}/sos/latest`, `GET /admin/surveillance/patients`, `GET /admin/surveillance/patients/{id}`, `GET /admin/surveillance/alerts` (?unresolvedOnly), `POST /admin/surveillance/alerts/{id}/resolve`, `GET /admin/surveillance/sos` (?status), `POST /admin/surveillance/sos/{id}/acknowledge`, `GET /admin/surveillance/patients/{id}/history` (?hours=24), `POST /admin/surveillance/simulate` (demo seeder).

### AiReminiscenceController — base `/api/v1/ai/reminiscence`
`POST /chat`, `POST /clues`, `POST /story-chapter`, `POST /bazaar`, `POST /proverb`, `POST /memoir-scribe` — all via `qwen2.5:1.5b`.

### GameSessionController — mapped to BOTH `/patients/{id}/sessions` and `/api/v1/patients/{id}/sessions`
`POST /patients/{id}/sessions` (save session telemetry), `GET /patients/{id}/sessions/stats` (session stats + rolling averages).

---

## 6. Entities (9 JPA models)

| Entity | Table | Notes |
|---|---|---|
| `Patient` | `patients` | Root aggregate: name, dob, gender, phone, relationship, caregiverId, preferredLanguage, culturalBackground, joyTriggers, createdAt; `@OneToMany` familyMembers + familiarPlaces, `@OneToOne` lifeStory + medicalProfile |
| `FamilyMember` | `family_members` | name, relation, notes, photoPath (`@ManyToOne` patient) |
| `FamiliarPlace` | `familiar_places` | name, category, description, photoPath, emoji (`@ManyToOne` patient) |
| `LifeStory` | `life_stories` | occupation, favoriteMusic, hobbies, lifeEvents (`@OneToOne` patient) |
| `MedicalProfile` | `medical_profiles` | rawReportPath, diagnosis, icd10, dateOfDiagnosis, examiningPhysician, clinicOrHospital, testType, mmseScore, maxScore, clinicalStage, recommendedStartDifficulty, mtaScore, fazekasGrade, llmSummary, primaryDeficits, impairedDomains, medicationsJson, clinicalDomainsJson, subscaleScoresJson, detailedAnalysisJson (`@OneToOne` patient) |
| `PatientCard` | `patient_cards` | id (UUID), patientId, secureToken (unique 64), isActive, issuedAt (standalone) |
| `SurveillanceReading` | `surveillance_readings` | heartRateBpm, spo2Pct, bodyTempC, activityLevel, steps, sleepHours, hydrationGlasses, latitude/longitude, geofenceStatus, locationLabel, deviceId, networkType, syncStatus, queuedPackets, batteryPct, riskScore (`@ManyToOne` patient) |
| `SurveillanceAlert` | `surveillance_alerts` | alertType, severity, message, source, resolved, resolvedAt, assignedAsha, triggeredAt |
| `CaregiverSosRequest` | `caregiver_sos_requests` | patientLat/Lng, locationLabel, status (PENDING/ACKNOWLEDGED/RESOLVED), acknowledgedBy, requestedAt, acknowledgedAt |
| `GameSession` | `game_sessions` | patientId (plain Long), gameType, durationSeconds, accuracyPercentage, spatialRecallScore, motorReactionTimeMs, hesitationCount, difficultyLevel, timestamp |

---

## 7. Services

| Service | Responsibility |
|---|---|
| `FileStorageService` | Disk storage under `app.upload.dir/patients/{id}/{photos\|reports}/`, UUID+ext naming; serves `UrlResource` |
| `MedicalReportService` | Hybrid clinical extraction (§9) |
| `PatientCardService` | QR health-card generation/rotation; kiosk `scan()`; `demoLogin()` → patient `id=2` |
| `JwtService` | Hand-rolled HS256 generate/validate/expiry |
| `SurveillanceService` | Readings/alerts/SOS ingestion, admin reads, auto-alert rules, demo simulator |
| `GameSessionService` | Persist session telemetry + rolling stats; Ollama 3-sentence clinical summary w/ rule-based fallback |
| `OllamaReminiscenceService` | 6 AI features (chat, clues, story-chapter, bazaar, proverb, memoir-scribe) via `qwen2.5:1.5b` |

---

## 8. Global Error Handling

`GlobalExceptionHandler` returns `ApiError { timestamp, status, error, message }`:
- `PatientNotFoundException` → **404**
- `InvalidQrTokenException` → **401** ("Invalid or inactive QR card token")
- `AuthenticationRequiredException` → **401**
- `MethodArgumentNotValidException` → **400** (first field error)
- Generic `Exception` → **500**

---

## 9. Hybrid AI Clinical Extraction Pipeline

`MedicalReportService.analyzeReport`:

1. **PDFBox 3.0.3** text extraction (`PDDocument`/`PDFTextStripper`).
2. **Regex fast-path** (`extractFastRegexMetrics`): MMSE/MoCA total `score/max`, clinical stage from score, 5 subscales, MTA grade, Fazekas grade, ICD-10, physician.
3. **Rule-based stage calibration** (7 cognitive + 6 IADL + 4 behavioral = **17 domains** derived from subscales/stage).
4. **Ollama polish** (`qwen2.5:1.5b`, `format=json`, `stream=false`, temperature 0.0, `num_predict=600`) — extracts diagnosis, clinicalStage, active medications, summary, subscales, domains.
5. **Merge semantics**: Ollama only overwrites non-null fields, so deterministic rule-based metrics are never wiped; includes JSON-truncation repair; on LLM failure falls back to rule-based summary. Skips the LLM entirely for very short extracted text (scanned PDFs).

**Stage rubric (MMSE/MoCA / 30):** `≥24` MCI/Level 3 · `18–23` Early/Level 2 · `10–17` Moderate/Level 1 · `<10` Severe/Level 1 (high assist).

**17 domains:** Cognitive (7) — Memory, Attention, Executive Function, Orientation, Language, Visuospatial, Decision Making; IADLs (6) — Medication, Financial, Navigation, Meal Prep, Driving, Household; Behavioral (4) — Apathy, Agitation, Social Withdrawal, Sleep Disturbance.

---

## 10. Surveillance & SOS Behavior

- **`recordReading`** persists a reading and auto-raises alerts: geofence OUTSIDE → `WANDERING_GEOFENCE`/CRITICAL; HR >120 or <50 → `VITAL_ANOMALY`/HIGH; SpO2 <92 → `VITAL_ANOMALY`/CRITICAL; steps ==0 → `LOW_ACTIVITY`/MODERATE.
- **`processSos`** saves a `CaregiverSosRequest` (status PENDING) **and** creates a CRITICAL `SOS_CALL_CAREGIVER` alert. `acknowledgeSos` marks ACKNOWLEDGED with operator + timestamp. The caregiver frontend polls `sos/latest` (404 → logs out / redirects).
- **Risk scoring** (`summarize`): `riskScore` with thresholds `≥75` CRITICAL / `≥50` HIGH / `≥25` MODERATE / else LOW (open alerts floor at 65).
- **`POST /admin/surveillance/simulate`** — the only runtime seeder: ~24 h of readings (~2 h intervals), alerts, and one PENDING SOS against existing patients (returns `NO_PATIENTS` if the DB is empty).

---

## 11. Static File Serving & Uploads

- `WebConfig` registers `addResourceHandler("/uploads/**")` → `file:{app.upload.dir}/` with public cache (7-day max-age) and CORS for GET.
- Media is served at **`/uploads/{relativePath}`** (NOT `/api/v1/uploads/**`); patient/family photo URLs embed this path.

---

## 12. Seed Data & Demo Patients

- **No automated `data.sql` / CommandLineRunner seeder** is present. Demo patients must be created via onboarding or sampled into the frontend's `public/sample-images/`.
- The **live MariaDB** (`localhost:3306/cognicare`) currently holds two demo patients: `id 1 = Mary Nongrum` (en), `id 2 = Biren Borah` (as, Assamese).
- **Demo login** `POST /api/v1/auth/kiosk/demo` returns patient **`id=2` (Biren Borah)** and signs a 12 h JWT.
- `AdminController` names (Biren Borah id 1, Mary Nongrum id 2) are **hardcoded in-memory mission-control constants** and do not reflect the DB; the live DB assignment is the source of truth.
- Note: the frontend sample-image folder names are swapped relative to the DB (`patient_1_biren_borah`, `patient_2_mary_nongrum`) — a pre-existing asset naming quirk.

---

## 13. Verification

```bash
# Compile
./mvnw -o compile

# Run (MariaDB default)
./mvnw -o spring-boot:run

# Run (H2 demo profile)
./mvnw -o spring-boot:run -Dspring-boot.run.profiles=demo

# Smoke: demo login returns patient id=2 + JWT
curl -X POST http://localhost:8080/api/v1/auth/kiosk/demo
```

- **Error contract**: all failures return `ApiError { timestamp, status, error, message }`.
- **Auth contract**: `/api/v1/patients/**` is JWT-intercepted (fail-open); kiosk/scan issues a 12 h HS256 token; `sub` = patient id.