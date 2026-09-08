# CogniCare: An AI-Based Cognitive Gaming & Memory Assistance Platform for Elderly Dementia Patients in the North Eastern Region

**Problem Statement SIH26003** — MDoNER, Category: Software, Theme: MedTech/BioTech/HealthTech

---

## 1. Executive Summary

CogniCare is an AI-powered Cognitive Digital Therapeutics (CDTx) and memory-assistance platform purpose-built for elderly dementia, Alzheimer's, and Mild Cognitive Impairment (MCI) patients across the eight states of the North Eastern Region (NER) of India — a direct, working response to MDoNER Problem Statement SIH26003.

The platform combines a **comprehensive suite of culturally anchored serious cognitive games**, a **local on-device AI clinical-intake engine**, **multilingual voice-assisted interaction covering the major languages of the NER**, **real-time adaptive difficulty driven by a quantified multi-domain cognitive profile**, a **zero-touch QR kiosk**, **fully offline-first operation**, **caregiver monitoring with SOS surveillance**, and an **NER-wide command center for the Ministry**. It is engineered around the lived culture of the Northeast — tea gardens of Assam, Majuli pottery, Meghalaya's living root bridges, Brahmaputra boats, the Bihu dhol, and the region's folklore — because a therapy a grandmother recognises is a therapy she will use.

CogniCare is a *digital therapeutic*, not a brain game: every activity maps to a cognitive domain, every session feeds a quantified clinical profile, and each patient's trajectory is calibrated against standard neurocognitive scales. Caregivers see progress, clinicians see evidence, and MDoNER sees population-level epidemiology. It works where patients actually are — villages with poor connectivity and low specialist access — and no patient data ever leaves the local clinic or device.

## 2. Problem Deep-Dive and Regional Context

**The demographic pressure.** India has one of the world's largest and fastest-growing elderly populations living with dementia and age-related cognitive disorders — a burden projected to grow sharply as life expectancy rises.

**The NER-specific crisis.** The eight states — Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, and Sikkim — share three structural burdens:

1. **Geographic isolation** — hilly and riverine terrain, dispersed rural settlements, and long travel distances place families days away from any neurology or geriatric consultation.
2. **Severely limited specialists** — among India's lowest densities of neurologists, psychiatrists, and geriatricians, concentrated in a few urban pockets, leaving the rural majority without screening, therapy, or follow-up.
3. **Language and cultural diversity** — dozens of languages and distinct cultural identities mean any solution delivered only in English or Hindi excludes precisely the elders who need it most.

**The human cost.** Dementia in NER families manifests as memory decline, confusion, anxiety, depression, wandering, and social isolation for the patient — and as continuous, unresourced monitoring, fatigue, and burnout for caregivers, with a disproportionate burden on working-age women. Without structured cognitive stimulation and monitoring, decline accelerates, quality of life collapses, and families become de-facto care institutions with no support.

**Why the status quo fails.** Existing offerings fall into three unusable categories:

1. **English-only western brain games** with no cultural anchor, no regional language, and no clinical grounding — irrelevant to an Assamese or Mizo elder.
2. **Clinic-based clinical assessment** that requires a specialist visit — impossible for rural families to sustain.
3. **Static reminder apps and pill-timers** that fragment care, ignore the cognitive dimension, and give caregivers no visibility into improvement.

Between "too clinical to reach the patient" and "too trivial to help the clinician" there is a gap. CogniCare fills it.

## 3. The Solution: CogniCare CDTx

A complete, closed-loop Digital Therapeutics platform in five concentric layers:

1. **Clinical intake** — a caregiver uploads a patient's clinical record; a hybrid pipeline (rule-based fast-path + local on-device LLM) extracts and quantifies a **multi-domain cognitive profile** — cognitive, functional (Instrumental ADL), and behavioural — and calibrates a severity baseline.
2. **Adaptive therapy** — a personalised therapy suite of serious cognitive games whose difficulty adapts every session.
3. **Daily living assistance** — voice-enabled reminders for medicines, hydration, routine activities, and appointments.
4. **Monitoring & analytics** — caregiver dashboards, progress tracking, trajectory views, and an alert system.
5. **Public-health intelligence** — a state-wise command center visualising adherence, stability, and adoption.

Every layer is **offline-first**, **privacy-preserving**, and **accessibility-engineered for elders**.

## 4. The Cognitive Gaming Suite — Meeting Requirement (a)

CogniCare's therapy portfolio spans the full cognitive spectrum the problem statement demands, organised into clinically recognised domains:

- **Memory improvement & daily routine recall** — face- and event-based recall games, AI-guided conversational reminiscence, chronological life-milestone activities, family photo puzzles, auditory memory games, a structured daily-life story journey, and prospective-memory exercises built around the patient's actual day.
- **Attention & concentration** — selective-attention tasks, auditory working-memory span, spatial navigation and tracking, visual discrimination and search, and spatial orientation activities.
- **Pattern and object recognition** — pattern completion, categorisation and sorting, free-form drawing, and tactile motor-construction tasks.
- **Emotional and mental engagement** — immersive 3D spatial scenes, rhythm-and-tempo entrainment, motion-interactive movement games, and a conversational AI companion that grounds the patient emotionally in their own language.

Each game is mapped to a clinical domain so therapy is *prescribed stimulation* targeted at the patient's specific deficits — never random entertainment.

## 5. Adaptive AI Difficulty Engine — Meeting Requirement (b)

Every session feeds a live adaptive engine:

- **Multi-domain baseline** — the clinical-intake pipeline converts uploaded records into per-domain severity levels, so a patient never starts at the wrong difficulty.
- **Scaffolding** — hints and progressive support that withdraw as performance improves, following established rehabilitation principles.
- **Spaced retrieval** — memory items reappear at personally optimised intervals to maximise consolidation.
- **Continuous biomarkers** — movement, response timing, and voice patterns surface motor and attention signals that automatically tune activities.
- **Fatigue and hesitation detection** — subtle timing and interaction cues prompt rest or a domain switch.
- **Trajectory prediction** — longitudinal performance projects cognitive trends and raises early-intervention cues for clinicians.
- **Personalised pacing** — speech and interaction tempo calibrated to the patient's severity.

CogniCare measures each patient against **their own previous self** — yesterday's performance vs. today's — which is clinically sound and emotionally constructive.

## 6. Multilingual and Voice-Assisted Interaction — Meeting Requirement (c)

CogniCare is **multilingual-first**, covering the major languages spoken across the NER — Assamese, Bengali, Hindi, Nepali, Meitei (Manipuri), Mizo, Khasi, Bodo, Garo, and more — designed so additional languages can be added without architectural change.

- **No blank screens** — a fallback-safe translation architecture ensures that even untranslated content degrades gracefully to a primary language instead of rendering empty.
- **Full voice assistance** — every instruction, memory, reminder, and the AI companion can be spoken aloud through a hybrid neural-audio + native speech engine with cascading voice fallbacks, guaranteeing a comprehensible voice even where no native TTS model exists.
- **Read-aloud by default** — texts can be spoken automatically for elders with low literacy or visual impairment.
- **Conversational interaction** — voice-driven navigation and a spoken companion for patients who cannot read or type.

## 7. Cultural Anchoring in NER — Meeting Requirement (d)

CogniCare is built *from* Northeast culture rather than translated *at* it:

- **Themes** — Assam tea gardens, Majuli pottery, Meghalaya's living root bridges, Brahmaputra river crossings, the hornbill, the Bihu dhol.
- **Craft & motifs** — traditional weaving patterns, floor-art drawing, heritage recipes, and culturally familiar objects for memory stimulation.
- **Sound** — native instrumental and percussive audio, including rhythm entrainment for motor rehabilitation.
- **Folklore & language** — AI-generated local proverbs, tales, and life-story chapters for reminiscence.
- **Personal life-material** — caregivers upload the patient's own family photographs and places, so therapy is built around *their* life in *their* language.

For a dementia patient, familiarity is therapeutic. This is the engagement insight that makes the platform work where generic games fail.

## 8. Daily Living Assistance & Reminders — Meeting Requirement (e)

- **Medicine reminders** — timed, spoken, acknowledge-confirmed alerts per medication schedule.
- **Hydration reminders** — gentle periodic prompts.
- **Daily activities** — routine scheduling with prospective-memory activities that rehearse the patient's real day.
- **Medical appointments** — reminders synced to caregiver-created events.
- **Extended reach** — reminder delivery can extend beyond smartphones (e.g., interactive-voice-response relay) for households with basic phones.
- **Adherence tracking** — acknowledgments flow back to the caregiver as data.

## 9. Caregiver Monitoring & Dashboards — Meeting Requirement (f)

- **Cognitive performance tracking** — per-domain progress, session history, difficulty trajectory.
- **Adherence analytics** — activity completion vs. prescription, reminder acknowledgment rates.
- **Biomarker & trajectory views** — intuitive charts of cognitive and physical signals over time.
- **Alert system** — missed-medication, geofence, vitals, and SOS escalations; declining-trend cues that suggest clinician review.
- **Secure patient identity** — a printable QR identity card aligned with national digital-health conventions (ABDM/ABHA), and a one-touch SOS raising a caregiver alert in real time.

## 10. Offline-First, Low-Connectivity Architecture — Meeting Requirement (g)

- **On-device intelligence** — the clinical AI and adaptivity run locally; core therapy has no cloud dependency.
- **Native app** — the platform is packaged as a native Android tablet/mobile app with hardware bridges (camera, text-to-speech, haptics, screen keep-awake kiosk mode, safe back-button handling) and pre-seeded local assets.
- **Local-first storage & LAN sync** — a clinic-local server keeps all records on-site, syncing only within the clinic network.
- **Graceful degradation** — if speech or network services are unavailable the platform falls back seamlessly; even the login path supports a fully functional offline session.

This design means CogniCare is *more valuable the further it is from connectivity* — the opposite of typical cloud-AI health products.

## 11. Elderly-Friendly Mobile/Tablet Interface — Meeting Requirement (h)

- **Accessibility-first, GIGW-aligned** — multiple font sizes, high-contrast mode, and large tactile targets.
- **Kinesthetic design** — vibration feedback on taps compensates for tremor; oversized controls and generous spacing.
- **Zero-touch entry** — a QR kiosk removes passwords; a three-step flow leads to a spoken greeting.
- **Form-factor adaptive** — orientation and layout tuned for tablet and phone.
- **Deliberately calm** — full-screen distraction-free therapy, safe exit handling, legibility-first typography, and severity-calibrated speech pacing.

This is not a standard enterprise dashboard — it is a calm, dignified, one-thumb screen a 75-year-old can use on the first try.

## 12. Patient-Data Security & Privacy

- **Privacy-first architecture** — biometrics, voice, and camera data are processed on-device; clinical AI never transmits patient health information.
- **National digital-health alignment** — QR identity and kiosk flows are designed for Ayushman Bharat Digital Mission (ABDM/ABHA) compatibility.
- **Secure sessions** — token-based authentication with expiry, idle auto-timeout, and role-separated patient/caregiver/administrator surfaces.
- **Scoped transport** — any local-network traffic is limited to the clinic's own server; no external patient-data route exists.

## 13. Technology Approach

| Layer | Approach |
|---|---|
| **Web frontend** | Modern React-based stack, typed, multilingual-first, accessibility-hardened |
| **3D / vision / QR** | GPU-accelerated 3D, computer-vision hand tracking, camera QR scanning |
| **AI / LLM** | Local on-device models for clinical extraction and conversational reminiscence |
| **Backend** | A robust Java/Spring-based REST service with secure auth and media handling |
| **Data** | Clinic-local relational storage, demo-friendly alternative, multi-patient schemas with family and biomarker history |
| **Native app** | Capacitor-packaged Android build exposing hardware capabilities |

The entire platform builds and verifies reproducibly from source across all layers.

## 14. Innovation: What Makes This Different

1. **Culture-native dementia therapeutic for the NER** — not a translated western app, but built from NER cultural material.
2. **Closed clinical loop** — intake → adaptive therapy → monitoring → epidemiology in one offline platform.
3. **Affordable continuous cognitive assessment** — replacing episodic, unreachable specialist screening with on-device quantified profiling.
4. **Geriatric-grade accessibility** — accessibility thinking applied deliberately to elderly motor, vision, and cognitive constraints.
5. **Ministry-scale population intelligence** — the same device that treats a grandmother also streams de-identified data to a state-wise command center, giving MDoNER its first NER-wide dementia-telemetry gauge.
6. **True offline intelligence** — on-device AI and clinic-LAN sync engineered for connectivity-scarce geographies.

## 15. Feasibility & Execution Plan

The platform already exists as a **working prototype** across all three layers (frontend, backend, native). Planned phases:

| Phase | Focus |
|---|---|
| **P1 — Core therapeutics** | Game portfolio, adaptive engine, multilingual + voice layer |
| **P2 — Clinical pipeline** | Record intake, quantified multi-domain profiling, severity calibration, local AI |
| **P3 — Caregiver & monitoring** | Dashboards, reminders, alerts, SOS, surveillance |
| **P4 — Offline & native** | Android packaging, offline sync, kiosk mode, clinic-local deployment |
| **P5 — Ministry telemetry** | Command center, administration, audit, digital-health alignment |

Each phase ends in verifiable builds, end-to-end offline smoke tests, and prototype demos.

## 16. Scalability & Adoption Roadmap for MDoNER

- **Pilot** — deploy to selected PHCs across two NER states with a cohort of elderly patients; instrument adoption, adherence, and outcome proxies.
- **Widen** — onboard Anganwadi/ASHA workers, community kiosks in village councils and PHC waiting halls, and reminder relay for non-smartphone households.
- **Scale** — roll out across the eight states; the command center becomes a standing health-intelligence surface informing NER dementia policy and screening drives.
- **Extend** — caregiver co-pilot support, tele-health integration, and physical kiosks for resource-constrained centers.

## 17. Expected Impact

- **Clinical** — early cognitive intervention for elders currently unreachable; measurable maintenance/improvement of cognition; reduced anxiety and isolation through engagement and companionship.
- **Caregiver** — structured continuous monitoring that relieves unmanaged strain; even caregiver-burnout signals are surfaced to administrators.
- **Systemic** — the first NER-wide dementia adherence and epidemiology dataset, giving MDoNER and allied health schemes an evidence base for allocation.
- **Equity** — multilingual, offline, low-cost delivery to the most isolated elderly — inclusive digital healthcare by definition.

## 18. Conclusion

CogniCare addresses every element of SIH26003 with a **working, offline-first, multilingual, AI-adaptive digital therapeutic** engineered for the Northeast. It turns an isolated, anxious, declining experience into a dignified, engaged, clinically measured one — for the grandmother in a Shillong village, the exhausted caregiver in Golaghat, the overstretched clinician in Guwahati, and the Ministry that must see the whole region. Not a generic app for the Northeast — a therapeutic built *by and for* the Northeast.