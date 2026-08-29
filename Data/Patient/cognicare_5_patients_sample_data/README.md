# CogniCare • Complete 5-Patient Master Sample Dataset
**MDONER Cognitive Health Initiative • Smart India Hackathon 2026 (SIH 2026 PS 26003)**

This archive contains **5 full patient profiles** covering 5 Northeast Indian states (Assam, Meghalaya, Manipur, Mizoram, Nagaland), including **25 relative portrait images** (5 per patient), **25 familiar place landmark images** (5 per patient), **5 category icons**, structured JSON datasets, and flat CSV tables.

---

## 📊 Summary of Dataset

| # | Patient Name | State / City | Age | Gender | Relatives Images | Familiar Places Images | Language |
|---|--------------|--------------|-----|--------|------------------|------------------------|----------|
| 1 | **Biren Borah** | Assam (Guwahati) | 72 | Male | 5 Images (`relatives/`) | 5 Images (`places/`) | Assamese (অসমীয়া) |
| 2 | **Mary Nongrum** | Meghalaya (Shillong) | 68 | Female | 5 Images (`relatives/`) | 5 Images (`places/`) | English (Khasi) |
| 3 | **Tongbram Ibochouba Singh** | Manipur (Imphal) | 75 | Male | 5 Images (`relatives/`) | 5 Images (`places/`) | English (Meiteilon) |
| 4 | **Lalhmingmawii Sailo** | Mizoram (Aizawl) | 64 | Female | 5 Images (`relatives/`) | 5 Images (`places/`) | English (Mizo) |
| 5 | **Kevichüsa Angami** | Nagaland (Kohima) | 74 | Male | 5 Images (`relatives/`) | 5 Images (`places/`) | English (Tenyidie) |

**Total visual assets**: 50 High-Resolution Illustration Photo Cards + 5 Category UI Icons = **55 Images**.

---

## 📁 Folder Structure

```
cognicare_5_patients_sample_data/
├── README.md
├── ALL_5_PATIENTS_FORM_FILLING_GUIDE.md
├── json/
│   ├── patient_1_biren_borah.json
│   ├── patient_2_mary_nongrum.json
│   ├── patient_3_ibochouba_singh.json
│   ├── patient_4_lalhmingmawii_sailo.json
│   ├── patient_5_kevichusa_angami.json
│   └── cognicare_all_5_patients_seed.json
├── csv/
│   ├── patients_master_5_profiles.csv
│   ├── family_members_25_relatives.csv
│   ├── familiar_places_25_locations.csv
│   └── daily_routines_5_patients.csv
└── images/
    ├── patient_1_biren_borah/ (5 relative photos + 5 place photos)
    ├── patient_2_mary_nongrum/ (5 relative photos + 5 place photos)
    ├── patient_3_ibochouba_singh/ (5 relative photos + 5 place photos)
    ├── patient_4_lalhmingmawii_sailo/ (5 relative photos + 5 place photos)
    ├── patient_5_kevichusa_angami/ (5 relative photos + 5 place photos)
    └── icons/ (icon_home.png, icon_market.png, icon_temple.png, icon_clinic.png, icon_park.png)
```
