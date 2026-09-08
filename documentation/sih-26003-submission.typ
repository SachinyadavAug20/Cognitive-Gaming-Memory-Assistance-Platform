#let brand = rgb("#15803D")
#let ink = rgb("#1a1a1a")
#let gray = rgb("#777777")

#set page(
  paper: "a4",
  margin: (top: 2cm, bottom: 2cm, left: 2.2cm, right: 2.2cm),
  numbering: none,
)
#set text(font: "New Computer Modern", size: 10pt, fill: ink)
#set par(justify: true, leading: 1.15em)

#let fieldlabel(label, note) = {
  block(above: 1.4em, below: 0.55em)[
    #set text(weight: "bold", size: 14pt, fill: brand)
    #text(label)
    #set text(size: 9pt, fill: gray, weight: "regular")
    #h(0.6em)#text(note)
  ]
  line(length: 100%, stroke: 1.4pt + brand)
}

#let h2(body) = {
  block(above: 1.05em, below: 0.4em)[
    #set text(weight: "bold", size: 12.5pt, fill: ink)
    #text(body)
    #v(0.14em)
    #line(length: 100%, stroke: 0.6pt + rgb("#c8d9cf"))
  ]
}

#let h3(body) = {
  block(above: 0.75em, below: 0.25em)[
    #set text(weight: "bold", size: 10.5pt, fill: brand)
    #text(body)
  ]
}

#let bullets(xs) = list(xs, marker: [—], spacing: 0.28em)

/* ============ 1. IDEA TITLE ============ */

#fieldlabel[IDEA TITLE][(Max 100 characters)]

#block[
  #set text(size: 16pt, weight: "bold", fill: brand)
  CogniCare CDTx: AI Cognitive Gaming & Memory Assistance for Elderly Dementia Patients in NER
]

/* ============ 2. IDEA DESCRIPTION ============ */

#fieldlabel[IDEA DESCRIPTION][(Max 50,000 characters)]

#h2[1. What We Are Building]

CogniCare is an AI-enabled cognitive gaming and memory-assistance digital therapeutic for elderly dementia, Alzheimer's, and mild-cognitive-impairment patients across the eight states of India's North Eastern Region. In one line: an offline, multilingual, doctor-authorized cognitive-therapy platform that runs on a simple tablet and gives MDoNER its first NER-wide view of dementia care.

It delivers adaptive cognitive games and memory training, voice assistance in the region's languages, doctor-approved therapy plans, caregiver dashboards, daily-living reminders, offline synchronization, and secure patient-data handling — every element the problem statement requests.

#h2[2. The Problem (NER-Focused)]

The North Eastern Region faces a quiet crisis. Age-related cognitive disorders are rising among the elderly, yet the region combines:

#bullets[
  *Geographic isolation* — hilly, riverine, dispersed settlements; families are often days away from the nearest review.
  *A severe specialist shortage* — neurologists, psychiatrists, and geriatricians are rare and city-bound; the rural elderly seldom see one twice.
  *A language and culture gap* — dozens of languages and distinct identities make English/Hindi-only tools useless to many elders.
]

Consequence: memory decline, confusion, anxiety, and social isolation grow unmanaged; caregivers (often working-age women) monitor around the clock with no structured support; and early intervention never happens because it cannot reach the patient.

#h2[3. Why Existing Solutions Fail]

#bullets[
  *Western brain games* — no cultural anchor, no regional language, no clinical oversight; unengaging and unverifiable.
  *Clinic-based cognitive assessment* — requires specialist travel rural families cannot sustain; screening happens once, if at all.
  *Reminder and pill apps* — fragment care and ignore the cognitive dimension completely.
]

Nothing connects a rural NER elder to measurable, culturally fitting, doctor-governed cognitive therapy. That is the gap CogniCare fills.

#h2[4. The CogniCare Way: Therapy, Not a Cure]

CogniCare is explicit about what it is: daily cognitive therapy, early intervention, and engagement — not a cure for dementia. Every design decision serves realistic goals: maintaining and exercising remaining cognition, slowing avoidable decline through consistent stimulation, reducing anxiety and isolation, and giving clinicians data to act earlier.

#h2[5. How It Works]

#h3[5.1 Doctor-Authorized Game Therapy (Clinical Governance First)]

The differentiator that makes CogniCare a therapeutic rather than an activity app:

#bullets[
  A doctor (neurologist, geriatrician, or PHC physician) reviews the patient's clinical record.
  The doctor authorizes which cognitive domains and games are appropriate, sets difficulty boundaries and session targets, and can update the plan remotely.
  Content a doctor has not authorized never reaches the patient; every session runs under the doctor's plan.
  This gives MDoNER a defensible, clinically governed model that no generic game app can claim.
]

#h3[5.2 Adaptive AI Engine]

#bullets[
  The clinical record is converted into a multi-domain cognitive profile (cognitive, functional, behavioural) and a severity baseline.
  Difficulty, scaffolding, and speech pacing adapt every session from real performance — each patient competes against yesterday's self, not against young adults.
  Continuous signals (movement, response timing, voice) tune motor and attention activities, detect hesitation and fatigue, and prompt rest or a domain switch.
  Longitudinal trends reach the doctor and caregiver to enable early intervention.
]

#h3[5.3 The Cognitive Game Suite (Requirement a)]

Interactive games and activities spanning every area the statement demands:

#bullets[
  *Memory improvement and daily-routine recall* — face and event recall, conversational reminiscence, life milestones, family-photo tasks, daily-routine prospective memory.
  *Attention and concentration* — selective attention, auditory span, spatial tracking, visual search, orientation.
  *Pattern and object recognition* — pattern completion, categorization, drawing, construction.
  *Emotional and mental engagement* — immersive 3D scenes, rhythm entrainment, movement games, and a conversational companion.
]

#h3[5.4 Multilingual and Voice-Assisted (Requirement c)]

#bullets[
  Covers the major NER languages — Assamese, Bengali, Hindi, Nepali, Meitei, Mizo, Khasi, Bodo, Garo and more — extensible without architectural change.
  Every instruction, memory, reminder, and the companion can be spoken aloud; read-aloud-by-default supports low-literacy and visually impaired elders.
  Voice fallbacks guarantee a comprehensible voice even where no native speech model exists.
]

#h3[5.5 Culturally Anchored for the NER (Requirement d)]

#bullets[
  Themes, visuals, and sounds drawn from the Northeast: tea gardens, Majuli pottery, living root bridges, Brahmaputra crossings, hornbills, Bihu dhol rhythms, weaving motifs, and local folklore.
  Caregivers upload the patient's own family photos and places, so therapy rehearses their life, in their language.
  Cultural familiarity is the engagement engine: a therapy a grandmother recognizes is a therapy she will use.
]

#h3[5.6 Daily-Living Assistance and Reminders (Requirement e)]

#bullets[
  Spoken, acknowledged reminders for medicines, hydration, daily activities, and medical appointments.
  Acknowledgments flow back to caregivers as adherence data; delivery extends beyond smartphones for basic-phone households.
]

#h3[5.7 Caregiver Monitoring and Alerts (Requirement f)]

#bullets[
  Cognitive performance, session completion vs. prescription, and trajectory charts.
  Missed-medication, geofence, vitals, and SOS escalations; declining-trend cues flag earlier clinician review.
  QR identity aligned with national digital-health conventions, and one-touch SOS to the caregiver.
]

#h3[5.8 Offline-First for Low Connectivity (Requirement g)]

#bullets[
  Clinical AI and adaptivity run on-device; core therapy has zero internet dependency.
  Clinic-local storage and LAN synchronization keep records on-site; the app degrades gracefully — even login works offline.
  Engineered to work better the farther it is from connectivity — the opposite of most cloud-AI health products.
]

#h3[5.9 Elderly-Friendly Mobile/Tablet Interface (Requirement h)]

#bullets[
  Large fonts, high contrast, generous tactile targets; vibration feedback compensates for tremor.
  Zero-touch QR kiosk entry removes passwords; full-screen, distraction-free sessions; safe exit handling; tablet- and phone-adaptive layouts.
  A calm, dignified, one-thumb interface a 75-year-old can use on the first try.
]

#h3[5.10 Direct Patient–Doctor Connection]

#bullets[
  Easy connection by design: the doctor sees each patient's progress, trends, adherence, and alerts in one view; the caregiver receives the doctor's updated game plan and follow-up guidance without coordination overhead.
  Every tablet becomes a remote-review clinic, reducing the travel burden that blocks follow-up care today.
]

#h3[5.11 Security and Privacy]

#bullets[
  Biometrics, voice, and camera data are processed on device; no health information leaves the clinic.
  Sessions are token-secured with expiry and idle timeouts; patient, caregiver, doctor, and administrator surfaces are role-separated.
  ABDM/ABHA-aligned identity flows.
]

#h2[6. Technology]

#bullets[
  *Frontend:* a modern React-based, multilingual-first, accessibility-hardened web app.
  *AI:* local on-device models for clinical extraction and conversational reminiscence.
  *Backend:* a Java/Spring REST service with secure auth and media handling.
  *Data:* clinic-local relational storage; multi-patient schemas with family and biomarker history.
  *Native:* Capacitor-packaged Android app exposing camera, text-to-speech, haptics, and kiosk controls.
]

The full stack builds and verifies reproducibly from source.

#h2[7. Why CogniCare Wins]

#bullets[
  *Therapy, not entertainment* — doctor-authorized, clinically governed, measurable.
  *Built for the NER, not translated for it* — culture, languages, and terrain are the design brief.
  *True offline intelligence* at rural price points, on ordinary tablets.
  *One platform closes the loop* for patient, caregiver, doctor, and Ministry.
  *Already a working prototype* — not a promise.
]

#h2[8. Proof and Execution]

A working prototype exists across all three layers — web frontend, backend service, and native Android app — with offline behavior, multilingual voice, adaptive games, and caregiver surfaces already functional. Planned phases: core therapeutics; clinical pipeline and doctor authorization; caregiver and monitoring; offline and native hardening; MDoNER command center. Each phase ends in verifiable builds and an offline smoke test.

#h2[9. Impact]

#bullets[
  *Elders:* realistic cognitive therapy and companionship, at home, in their language, at their pace.
  *Caregivers:* monitored adherence and alerts that replace unmanaged around-the-clock strain.
  *Doctors:* a data feed for early intervention and remote follow-up across the region.
  *MDoNER:* the first NER-wide dementia telemetry and adherence intelligence to guide policy and screening.
]

#h2[10. Conclusion]

The problem statement asks for an accessible, engaging, AI-enabled cognitive gaming and memory-assistance platform for NER dementia patients. CogniCare answers with a working, doctor-authorized, offline-first, multilingual digital therapeutic — therapy, not a cure — built for the Northeast, from the Northeast.

/* ============ 3. ABSTRACT / SUMMARY ============ */

#fieldlabel[ABSTRACT / SUMMARY][(Max 10,000 characters)]

CogniCare is an AI-powered cognitive gaming and memory-assistance platform for elderly dementia patients across India's North Eastern Region (NER) — engineered as continuous cognitive therapy and early intervention, not as a cure.

The NER is the hardest place in India to grow old with dementia. Hill and riverine terrain isolates villages from the few available specialists; neurology, psychiatry, and geriatric care are concentrated in a handful of towns; and a dozen languages mean most national solutions never reach — or speak to — the elders who need them. Families carry the burden alone.

CogniCare closes this gap with a therapy-first platform that runs fully offline on a simple tablet, speaks the region's languages, and is built around its culture:

#bullets[
  *Doctor-authorized cognitive therapy* — a treating doctor reviews the patient's record, approves the relevant game domains, and sets difficulty boundaries, so therapy is prescribed, not casually recommended.
  *Adaptive AI* — an on-device engine quantifies each patient's cognitive profile and adapts difficulty, scaffolding, and pacing session by session from real performance.
  *The Northeast, not a translation* — games, visuals, sounds, and speech are anchored in tea gardens, Majuli pottery, living root bridges, the Brahmaputra, and the Bihu dhol, so engagement feels like home.
  *A multilingual, voice-first experience* covering the major NER languages, so even non-literate elders can use it independently.
  *Daily living support* — spoken reminders for medicines, hydration, activities, and appointments.
  *A simple, secure patient–doctor connection* — progress and trends reach the doctor automatically, enabling remote follow-up without travel.
  *Caregiver dashboards and alerts*, plus a state-level telemetry view for MDoNER.
  *Privacy by design* — patient data is processed and stored on-device and within the clinic, aligned with ABDM/ABHA.
]

CogniCare makes realistic cognitive therapy available to the most isolated elderly in India — measurable, affordable, and dignified. A working prototype already exists across web, backend, and native Android; it is ready to pilot with PHCs across the NER.