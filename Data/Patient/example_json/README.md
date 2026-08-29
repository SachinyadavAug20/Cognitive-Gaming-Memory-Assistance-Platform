# CogniCare • Example Patient JSON (Quick Import)

Ready-to-paste JSON for the onboarding form's **"🛠 Dev Tools: Import JSON"** panel. All photos are bundled and auto-attach on import.

## Quick Start (3 steps)

1. **Open** one of the example files below.
2. **Copy** its entire contents.
3. **Paste** into `add-patient` → `🛠 Dev Tools: Import JSON` → click **Apply Data**.

The wizard pre-fills automatically and loads all 5 relative + 5 place photos instantly. You can keep editing any step before submitting.

| File | Patient | State | Relatives | Places | Language |
|---|---|---|---|---|---|
| `example_patient_1_biren_borah.json` | Biren Borah (72) | Assam | 5 | 5 | Assamese |
| `example_patient_2_mary_nongrum.json` | Mary Nongrum (68) | Meghalaya | 5 | 5 | English |
| `example_patient_3_ibochouba_singh.json` | Tongbram Ibochouba Singh (75) | Manipur | 5 | 5 | English |
| `example_patient_4_lalhmingmawii_sailo.json` | Lalhmingmawii Sailo (64) | Mizoram | 5 | 5 | English |
| `example_patient_5_kevichusa_angami.json` | Kevichüsa Angami (74) | Nagaland | 5 | 5 | English |

> **⚠ Do NOT paste `cognicare_all_5_patients_seed.json`** — it is a wrapper
> object (`{ organization, project, …, patients: [...] }`), not a single
> patient object, and the importer will reject it.

## How the images work

Each relative and place carries an `image_file` that points into the bundled
asset folder (e.g. `images/patient_1_biren_borah/relatives/01_son_manash_borah.png`).
The importer serves those from `/sample-images/…` (copied into the Next.js
`public/` directory), converts them to `File` objects, and shows previews
immediately — no manual upload needed.

If you skip a photo on purpose, it is simply omitted; entries without an
`image_file` fall back to manual selection.