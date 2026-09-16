package com.sih.cognicare.service.impl;

import com.sih.cognicare.dto.*;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AdminRegionalSeedDataProvider {

    public Map<String, AdminClinicalAlertDTO> createInitialClinicalAlertsStore() {
        Map<String, AdminClinicalAlertDTO> alertsStore = new ConcurrentHashMap<>();

        alertsStore.put("ALT-001", AdminClinicalAlertDTO.builder()
                .id("ALT-001")
                .patientId(1L)
                .patientName("Biren Borah")
                .location("Majuli Island, Assam")
                .alertType("TREMOR_SPIKE")
                .severity("HIGH")
                .clinicalNote("Micro-hesitation increased by 35% during Tea Garden Harvest session. Recommended ASHA motor evaluation.")
                .assignedAsha("Priyanka Saikia (PHC Kamalabari)")
                .resolved(false)
                .triggeredAt(LocalDateTime.now().minusHours(2))
                .build());

        alertsStore.put("ALT-002", AdminClinicalAlertDTO.builder()
                .id("ALT-002")
                .patientId(2L)
                .patientName("Mary Nongrum")
                .location("East Khasi Hills, Meghalaya")
                .alertType("HYDRATION_DEFICIT")
                .severity("MODERATE")
                .clinicalNote("Hydration check-in recorded 2/6 glasses today. Caregiver reminder triggered.")
                .assignedAsha("Larisa Mawlong (Shillong PHC)")
                .resolved(false)
                .triggeredAt(LocalDateTime.now().minusHours(4))
                .build());

        alertsStore.put("ALT-003", AdminClinicalAlertDTO.builder()
                .id("ALT-003")
                .patientId(3L)
                .patientName("Ibochouba Singh")
                .location("Imphal West, Manipur")
                .alertType("WANDERING_RISK")
                .severity("CRITICAL")
                .clinicalNote("Late evening spatial disorientation flag in Wayfinding activity. Dispatched ASHA emergency ping.")
                .assignedAsha("Thoibi Devi (Imphal PHC)")
                .resolved(false)
                .triggeredAt(LocalDateTime.now().minusMinutes(45))
                .build());

        return alertsStore;
    }

    public Map<String, AdminTeleManasConsultationDTO> createInitialTeleManasConsultationStore() {
        Map<String, AdminTeleManasConsultationDTO> teleManasStore = new ConcurrentHashMap<>();

        teleManasStore.put("TM-AS-901", AdminTeleManasConsultationDTO.builder()
                .consultationId("TM-AS-901")
                .patientId(1L)
                .patientName("Biren Borah")
                .specialistDoctor("Dr. Abhijit Das, MD (Cognitive Neurology)")
                .hospitalCenter("AIIMS Guwahati - Tele-MANAS Regional Hub")
                .primaryDiagnosis("Mild Cognitive Impairment (MCI) - Spatial Recall Deficit")
                .scheduledAt(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0))
                .status("SCHEDULED")
                .videoCallUrl("https://esanjeevani.in/telemanas/room/tm-as-901")
                .aiPreAssessmentSummary("MoCA Score: 22/30. Recent Majuli 3D walk showed 94% accuracy with 780ms motor latency. Stable mood with grandchild AI chat.")
                .build());

        teleManasStore.put("TM-ML-902", AdminTeleManasConsultationDTO.builder()
                .consultationId("TM-ML-902")
                .patientId(2L)
                .patientName("Mary Nongrum")
                .specialistDoctor("Dr. Catherine Lyngdoh (Geriatric Psychiatry)")
                .hospitalCenter("NEIGRIHMS Shillong - Geriatric Clinic")
                .primaryDiagnosis("Early-Stage Alzheimer's Dementia")
                .scheduledAt(LocalDateTime.now().plusDays(2).withHour(15).withMinute(30))
                .status("SCHEDULED")
                .videoCallUrl("https://esanjeevani.in/telemanas/room/tm-ml-902")
                .aiPreAssessmentSummary("MoCA Score: 18/30. Living Root Bridge recall demonstrated 85% spatial path recognition. Daily routine adherence steady at 90%.")
                .build());

        return teleManasStore;
    }

    public List<AdminCulturalAssetDTO> createInitialCulturalHeritageAssetsStore() {
        List<AdminCulturalAssetDTO> culturalAssetsStore = new ArrayList<>();

        culturalAssetsStore.add(AdminCulturalAssetDTO.builder()
                .id("CUL-AS-01")
                .languageCode("as")
                .languageName("Assamese")
                .category("PROVERB")
                .textPrompt("ধানৰ ভঁৰাল, পুখুৰীৰ...")
                .nativeScript("ধানৰ ভঁৰাল, পুখুৰীৰ মাছ (অসমীয়া সুখৰ পৰিচয়)")
                .missingWordAnswer("মাছ")
                .culturalContext("Timeless Assamese proverb evoking agrarian peace and abundance.")
                .build());

        culturalAssetsStore.add(AdminCulturalAssetDTO.builder()
                .id("CUL-KHA-02")
                .languageCode("kha")
                .languageName("Khasi")
                .category("PROVERB")
                .textPrompt("Ka jingieit ia ka...")
                .nativeScript("Ka jingieit ia ka Mei-mariang (Love for Mother Nature)")
                .missingWordAnswer("Mei-mariang")
                .culturalContext("Sacred Khasi reverence for living root bridges and nature.")
                .build());

        culturalAssetsStore.add(AdminCulturalAssetDTO.builder()
                .id("CUL-MNI-03")
                .languageCode("mni")
                .languageName("Manipuri (Meitei)")
                .category("FESTIVAL_MEMORY")
                .textPrompt("Ningol Chakkouba numitta...")
                .nativeScript("নিংঙোল চাক্কৌবা নুমিৎতা ইচানুপীশিংবু কৌবা")
                .missingWordAnswer("ইচানুপী")
                .culturalContext("Beloved festival welcoming daughters and sisters home.")
                .build());

        return culturalAssetsStore;
    }

    public List<AdminAuditLogDTO> createInitialSystemAuditLogsStore() {
        List<AdminAuditLogDTO> auditLogsStore = new ArrayList<>();
        auditLogsStore.add(AdminAuditLogDTO.builder()
                .id("LOG-101")
                .actorRole("ADMIN_SUPERVISOR")
                .actorName("Dr. Hemanta Sarma")
                .actionType("CALIBRATE_AI")
                .targetPatientId(null)
                .details("Adjusted baseline reaction threshold to 850ms with sundowning acoustic mode ON.")
                .ipAddress("10.0.4.12")
                .timestamp(LocalDateTime.now().minusHours(1))
                .build());
        return auditLogsStore;
    }

    public Map<String, AdminAshaIncentiveDTO> createInitialAshaIncentivesStore() {
        Map<String, AdminAshaIncentiveDTO> ashaIncentivesStore = new ConcurrentHashMap<>();

        ashaIncentivesStore.put("ASHA-AS-01", AdminAshaIncentiveDTO.builder()
                .workerId("ASHA-AS-01")
                .workerName("Priyanka Saikia")
                .district("Majuli Island, Assam")
                .primaryPhc("Kamalabari Model PHC")
                .screeningsCompleted(18)
                .assistedGameSessions(42)
                .totalIncentiveInr(4200)
                .abhaLinkedBankMasked("SBI •••• 4092")
                .disbursementStatus("APPROVED")
                .lastVerifiedAt(LocalDateTime.now().minusDays(1))
                .build());

        ashaIncentivesStore.put("ASHA-ML-02", AdminAshaIncentiveDTO.builder()
                .workerId("ASHA-ML-02")
                .workerName("Larisa Mawlong")
                .district("East Khasi Hills, Meghalaya")
                .primaryPhc("Shillong Civil Outreach")
                .screeningsCompleted(14)
                .assistedGameSessions(31)
                .totalIncentiveInr(3100)
                .abhaLinkedBankMasked("HDFC •••• 8821")
                .disbursementStatus("PENDING_VERIFICATION")
                .lastVerifiedAt(LocalDateTime.now().minusDays(3))
                .build());

        ashaIncentivesStore.put("ASHA-MN-03", AdminAshaIncentiveDTO.builder()
                .workerId("ASHA-MN-03")
                .workerName("Bembem Devi")
                .district("Imphal West, Manipur")
                .primaryPhc("Lamphelpat Sub-Center")
                .screeningsCompleted(15)
                .assistedGameSessions(35)
                .totalIncentiveInr(3500)
                .abhaLinkedBankMasked("PNB •••• 1104")
                .disbursementStatus("APPROVED")
                .lastVerifiedAt(LocalDateTime.now().minusDays(2))
                .build());

        return ashaIncentivesStore;
    }

    public List<AdminEmergencyBroadcastDTO> createInitialEmergencyBroadcastsStore() {
        List<AdminEmergencyBroadcastDTO> broadcastsStore = new ArrayList<>();
        broadcastsStore.add(AdminEmergencyBroadcastDTO.builder()
                .broadcastId("BC-MAJULI-01")
                .targetState("Assam")
                .targetDistrict("Majuli River Island")
                .alertCategory("FLOOD_MONSOON_WANDERING")
                .language("as")
                .messageText("সাৱধান: ব্ৰহ্মপুত্ৰৰ জলস্তৰ বৃদ্ধি পাইছে। অনুগ্ৰহ কৰি বয়োজ্যেষ্ঠ ব্যক্তিসকলক নদীৰ পাৰলৈ অকলে যাব নিদিব।")
                .recipientsDelivered(128)
                .dispatchedAt(LocalDateTime.now().minusDays(2))
                .dispatchStatus("DELIVERED")
                .build());
        return broadcastsStore;
    }

    public List<AdminDistrictHealthDTO> getNorthEastDistrictsHealthStatistics() {
        return List.of(
                AdminDistrictHealthDTO.builder()
                        .state("Assam")
                        .district("Majuli River Island")
                        .enrolledPatients(14)
                        .mciStageCount(8)
                        .moderateStageCount(6)
                        .ashaWorkersActive(12)
                        .activeKiosks(2)
                        .cognitiveAdherenceRate(94.5)
                        .primaryPhc("Kamalabari Model PHC")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Assam")
                        .district("Kamrup Metropolitan")
                        .enrolledPatients(28)
                        .mciStageCount(19)
                        .moderateStageCount(9)
                        .ashaWorkersActive(22)
                        .activeKiosks(4)
                        .cognitiveAdherenceRate(91.2)
                        .primaryPhc("Dispur Capital Health Center")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Meghalaya")
                        .district("East Khasi Hills")
                        .enrolledPatients(19)
                        .mciStageCount(11)
                        .moderateStageCount(8)
                        .ashaWorkersActive(16)
                        .activeKiosks(3)
                        .cognitiveAdherenceRate(89.0)
                        .primaryPhc("Sohra Community Health Centre")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Manipur")
                        .district("Imphal West")
                        .enrolledPatients(16)
                        .mciStageCount(10)
                        .moderateStageCount(6)
                        .ashaWorkersActive(14)
                        .activeKiosks(2)
                        .cognitiveAdherenceRate(87.4)
                        .primaryPhc("Lamphelpat Model Hospital")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Mizoram")
                        .district("Aizawl Urban")
                        .enrolledPatients(12)
                        .mciStageCount(7)
                        .moderateStageCount(5)
                        .ashaWorkersActive(10)
                        .activeKiosks(2)
                        .cognitiveAdherenceRate(93.1)
                        .primaryPhc("Durtlang Health Center")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Nagaland")
                        .district("Kohima District")
                        .enrolledPatients(11)
                        .mciStageCount(6)
                        .moderateStageCount(5)
                        .ashaWorkersActive(9)
                        .activeKiosks(1)
                        .cognitiveAdherenceRate(86.5)
                        .primaryPhc("Naga Hospital Authority Kohima")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Arunachal Pradesh")
                        .district("Tawang Highland")
                        .enrolledPatients(8)
                        .mciStageCount(5)
                        .moderateStageCount(3)
                        .ashaWorkersActive(7)
                        .activeKiosks(1)
                        .cognitiveAdherenceRate(90.2)
                        .primaryPhc("Tawang District Hospital")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Tripura")
                        .district("West Tripura")
                        .enrolledPatients(15)
                        .mciStageCount(9)
                        .moderateStageCount(6)
                        .ashaWorkersActive(12)
                        .activeKiosks(2)
                        .cognitiveAdherenceRate(88.7)
                        .primaryPhc("Agartala Civil Hospital")
                        .build()
        );
    }

    public List<AdminEpidemiologicalSurveillanceDTO> getRegionalEpidemiologicalSurveillanceList() {
        return List.of(
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Assam")
                        .stateCode("AS")
                        .estimatedElderlyPopulation(2_680_000)
                        .screenedPatientsCount(36)
                        .mciPrevalencePct(6.8)
                        .dementiaPrevalencePct(3.4)
                        .earlyInterventionIndexPct(91.2)
                        .remoteTerrainBarrierIndex("RIVERINE_ISLAND")
                        .offlineSyncDelayAvgHours(1.4)
                        .activeAshaUnits(28)
                        .highRiskWanderingFlagged(2)
                        .sundowningAgitationHotspots(List.of("Majuli River Island", "Duliajan Tea Belts"))
                        .build(),
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Meghalaya")
                        .stateCode("ML")
                        .estimatedElderlyPopulation(245_000)
                        .screenedPatientsCount(11)
                        .mciPrevalencePct(7.4)
                        .dementiaPrevalencePct(3.9)
                        .earlyInterventionIndexPct(88.5)
                        .remoteTerrainBarrierIndex("EXTREME_HILL")
                        .offlineSyncDelayAvgHours(2.8)
                        .activeAshaUnits(14)
                        .highRiskWanderingFlagged(1)
                        .sundowningAgitationHotspots(List.of("East Khasi Hills (Cherrapunji Block)", "Williamnagar Garo Foothills"))
                        .build(),
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Manipur")
                        .stateCode("MN")
                        .estimatedElderlyPopulation(260_000)
                        .screenedPatientsCount(9)
                        .mciPrevalencePct(7.1)
                        .dementiaPrevalencePct(3.6)
                        .earlyInterventionIndexPct(89.0)
                        .remoteTerrainBarrierIndex("BORDER_TERRAIN")
                        .offlineSyncDelayAvgHours(3.1)
                        .activeAshaUnits(12)
                        .highRiskWanderingFlagged(1)
                        .sundowningAgitationHotspots(List.of("Ukhrul Hill Tracts", "Loktak Lake Belt"))
                        .build(),
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Mizoram")
                        .stateCode("MZ")
                        .estimatedElderlyPopulation(110_000)
                        .screenedPatientsCount(8)
                        .mciPrevalencePct(6.2)
                        .dementiaPrevalencePct(3.1)
                        .earlyInterventionIndexPct(94.2)
                        .remoteTerrainBarrierIndex("EXTREME_HILL")
                        .offlineSyncDelayAvgHours(2.2)
                        .activeAshaUnits(9)
                        .highRiskWanderingFlagged(0)
                        .sundowningAgitationHotspots(List.of("Champhai Border Ridges", "Lunglei South"))
                        .build(),
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Nagaland")
                        .stateCode("NL")
                        .estimatedElderlyPopulation(155_000)
                        .screenedPatientsCount(6)
                        .mciPrevalencePct(7.8)
                        .dementiaPrevalencePct(4.1)
                        .earlyInterventionIndexPct(86.4)
                        .remoteTerrainBarrierIndex("EXTREME_HILL")
                        .offlineSyncDelayAvgHours(3.6)
                        .activeAshaUnits(8)
                        .highRiskWanderingFlagged(1)
                        .sundowningAgitationHotspots(List.of("Tuensang Remote Ridge", "Mon Border Foothills"))
                        .build(),
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Arunachal Pradesh")
                        .stateCode("AR")
                        .estimatedElderlyPopulation(98_000)
                        .screenedPatientsCount(5)
                        .mciPrevalencePct(8.2)
                        .dementiaPrevalencePct(4.3)
                        .earlyInterventionIndexPct(84.0)
                        .remoteTerrainBarrierIndex("EXTREME_HILL")
                        .offlineSyncDelayAvgHours(4.2)
                        .activeAshaUnits(7)
                        .highRiskWanderingFlagged(1)
                        .sundowningAgitationHotspots(List.of("Tawang High-Altitude Sector", "Ziro Valley"))
                        .build(),
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Tripura")
                        .stateCode("TR")
                        .estimatedElderlyPopulation(320_000)
                        .screenedPatientsCount(7)
                        .mciPrevalencePct(6.9)
                        .dementiaPrevalencePct(3.5)
                        .earlyInterventionIndexPct(90.1)
                        .remoteTerrainBarrierIndex("ACCESSIBLE_VALLEY")
                        .offlineSyncDelayAvgHours(1.1)
                        .activeAshaUnits(10)
                        .highRiskWanderingFlagged(0)
                        .sundowningAgitationHotspots(List.of("Dhalai Tribal Belts", "Gomati Basin"))
                        .build(),
                AdminEpidemiologicalSurveillanceDTO.builder()
                        .state("Sikkim")
                        .stateCode("SK")
                        .estimatedElderlyPopulation(58_000)
                        .screenedPatientsCount(4)
                        .mciPrevalencePct(6.5)
                        .dementiaPrevalencePct(3.2)
                        .earlyInterventionIndexPct(93.5)
                        .remoteTerrainBarrierIndex("EXTREME_HILL")
                        .offlineSyncDelayAvgHours(1.8)
                        .activeAshaUnits(6)
                        .highRiskWanderingFlagged(0)
                        .sundowningAgitationHotspots(List.of("Mangan North Sikkim Valley", "Geyzing Ridges"))
                        .build()
        );
    }

    public List<AdminAshaWorkerDTO> getActiveAshaWorkersDirectory() {
        return List.of(
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-AS-01")
                        .name("Priyanka Saikia")
                        .phone("+91 94351-88201")
                        .assignedDistrict("Majuli")
                        .primaryPhc("Kamalabari Model PHC")
                        .assignedPatients(4)
                        .homeVisitsThisWeek(7)
                        .openAlerts(1)
                        .status("ON_FIELD")
                        .build(),
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-ML-02")
                        .name("Larisa Mawlong")
                        .phone("+91 98620-44102")
                        .assignedDistrict("East Khasi Hills")
                        .primaryPhc("Shillong Civil Outreach")
                        .assignedPatients(3)
                        .homeVisitsThisWeek(5)
                        .openAlerts(1)
                        .status("ACTIVE")
                        .build(),
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-MN-03")
                        .name("Bembem Devi")
                        .phone("+91 89740-11203")
                        .assignedDistrict("Imphal West")
                        .primaryPhc("Lamphelpat Sub-Center")
                        .assignedPatients(3)
                        .homeVisitsThisWeek(6)
                        .openAlerts(1)
                        .status("ACTIVE")
                        .build(),
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-MZ-04")
                        .name("Lalremsiami")
                        .phone("+91 96120-77804")
                        .assignedDistrict("Aizawl")
                        .primaryPhc("Durtlang Health Post")
                        .assignedPatients(2)
                        .homeVisitsThisWeek(4)
                        .openAlerts(0)
                        .status("ACTIVE")
                        .build()
        );
    }

    public List<AdminMedicationAdherenceDTO> getRegionalMedicationAdherenceList() {
        return List.of(
                AdminMedicationAdherenceDTO.builder()
                        .patientId(1L)
                        .patientName("Biren Borah")
                        .district("Majuli Island, Assam")
                        .activePrescriptions(List.of("Donepezil 5mg (Bedtime)", "Telmisartan 40mg (Morning)", "Vitamin B-12"))
                        .adherenceRate(94.5)
                        .missedDosesThisWeek(0)
                        .hydrationAvgGlasses(5)
                        .lastDoseTakenAt(LocalDateTime.now().minusHours(4))
                        .riskStatus("STABLE")
                        .build(),
                AdminMedicationAdherenceDTO.builder()
                        .patientId(2L)
                        .patientName("Mary Nongrum")
                        .district("East Khasi Hills, Meghalaya")
                        .activePrescriptions(List.of("Memantine 10mg (Twice Daily)", "Amlodipine 5mg", "Omega-3 Fatty Acid"))
                        .adherenceRate(86.0)
                        .missedDosesThisWeek(1)
                        .hydrationAvgGlasses(4)
                        .lastDoseTakenAt(LocalDateTime.now().minusHours(8))
                        .riskStatus("NEEDS_REMINDER")
                        .build(),
                AdminMedicationAdherenceDTO.builder()
                        .patientId(3L)
                        .patientName("Ibochouba Singh")
                        .district("Imphal West, Manipur")
                        .activePrescriptions(List.of("Rivastigmine Patch 4.6mg", "Losartan 50mg", "Calcium + Vitamin D3"))
                        .adherenceRate(78.0)
                        .missedDosesThisWeek(2)
                        .hydrationAvgGlasses(3)
                        .lastDoseTakenAt(LocalDateTime.now().minusHours(14))
                        .riskStatus("HIGH_RISK")
                        .build()
        );
    }

    public List<AdminKioskDeviceDTO> getKioskHardwareDevicesFleet() {
        return List.of(
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-DISPUR-01")
                        .villageLocation("Dispur Capital PHC Station")
                        .state("Assam")
                        .batteryPct(100)
                        .cameraFps(30)
                        .storageFreeMb(14200)
                        .firmwareVersion("v2.4.1-ner")
                        .isLowBandwidth2G(false)
                        .queuedPackets(0)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(1))
                        .deviceHealth("OPTIMAL")
                        .build(),
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-MAJULI-02")
                        .villageLocation("Kamalabari Ghat Rural Kiosk")
                        .state("Assam")
                        .batteryPct(88)
                        .cameraFps(28)
                        .storageFreeMb(8900)
                        .firmwareVersion("v2.4.1-ner")
                        .isLowBandwidth2G(true)
                        .queuedPackets(2)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(3))
                        .deviceHealth("OPTIMAL")
                        .build(),
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-SHILLONG-03")
                        .villageLocation("East Khasi Hills Sub-Center")
                        .state("Meghalaya")
                        .batteryPct(74)
                        .cameraFps(24)
                        .storageFreeMb(6500)
                        .firmwareVersion("v2.4.0-ner")
                        .isLowBandwidth2G(true)
                        .queuedPackets(1)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(8))
                        .deviceHealth("OPTIMAL")
                        .build(),
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-AIZAWL-04")
                        .villageLocation("Durtlang Hill Health Post")
                        .state("Mizoram")
                        .batteryPct(95)
                        .cameraFps(30)
                        .storageFreeMb(12100)
                        .firmwareVersion("v2.4.1-ner")
                        .isLowBandwidth2G(false)
                        .queuedPackets(0)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(2))
                        .deviceHealth("OPTIMAL")
                        .build()
        );
    }

    public List<AdminPredictiveTrajectoryDTO> getPredictiveCognitiveTrajectoriesList() {
        return List.of(
                AdminPredictiveTrajectoryDTO.builder()
                        .patientId(1L)
                        .patientName("Biren Borah (72 Yrs)")
                        .currentStage("MCI (Mild Cognitive Impairment)")
                        .currentMocaScore(22.5)
                        .predictedMoca30Days(22.8)
                        .predictedMoca60Days(22.4)
                        .predictedMoca90Days(22.1)
                        .riskClassification("STABLE_PRESERVED")
                        .adherenceImpactFactor(18.5)
                        .recommendedInterventions(List.of("Majuli Spatial Walk (3x/wk)", "Tea Harvest Motor Kinesthetics", "Grandchild Memoir Chat"))
                        .build(),
                AdminPredictiveTrajectoryDTO.builder()
                        .patientId(2L)
                        .patientName("Mary Nongrum (68 Yrs)")
                        .currentStage("Mild Alzheimer's Dementia")
                        .currentMocaScore(18.2)
                        .predictedMoca30Days(18.0)
                        .predictedMoca60Days(17.6)
                        .predictedMoca90Days(17.1)
                        .riskClassification("MODERATE_RISK")
                        .adherenceImpactFactor(14.0)
                        .recommendedInterventions(List.of("Living Root Bridge Pathways", "Hydration Scaffolding Reminders", "Khasi Folk Songs"))
                        .build(),
                AdminPredictiveTrajectoryDTO.builder()
                        .patientId(3L)
                        .patientName("Ibochouba Singh (76 Yrs)")
                        .currentStage("Moderate Dementia")
                        .currentMocaScore(14.0)
                        .predictedMoca30Days(13.5)
                        .predictedMoca60Days(12.8)
                        .predictedMoca90Days(12.0)
                        .riskClassification("ACCELERATED_DECLINE_RISK")
                        .adherenceImpactFactor(22.0)
                        .recommendedInterventions(List.of("Urgent Tele-MANAS Neurologist Referral", "Errorless Scaffolding Mode", "High-Priority ASHA Home Visit"))
                        .build()
        );
    }

    public List<AdminCaregiverBurnoutDTO> getCaregiverBurnoutAssessmentsList() {
        return List.of(
                AdminCaregiverBurnoutDTO.builder()
                        .caregiverId(101L)
                        .caregiverName("Anurag Borah")
                        .relationship("Son & Primary Caregiver")
                        .patientId(1L)
                        .patientName("Biren Borah")
                        .district("Majuli, Assam")
                        .zaritBurdenScore(24)
                        .burdenCategory("MILD_STRAIN")
                        .weeklyNightWanderingAlerts(0)
                        .daysActiveThisMonth(28)
                        .respiteCareStatus("STABLE_COPING")
                        .build(),
                AdminCaregiverBurnoutDTO.builder()
                        .caregiverId(102L)
                        .caregiverName("Grace Nongrum")
                        .relationship("Daughter")
                        .patientId(2L)
                        .patientName("Mary Nongrum")
                        .district("East Khasi Hills, Meghalaya")
                        .zaritBurdenScore(42)
                        .burdenCategory("MODERATE_STRAIN")
                        .weeklyNightWanderingAlerts(1)
                        .daysActiveThisMonth(26)
                        .respiteCareStatus("RESPITE_RECOMMENDED")
                        .build(),
                AdminCaregiverBurnoutDTO.builder()
                        .caregiverId(103L)
                        .caregiverName("Tomba Singh")
                        .relationship("Spouse (74 Yrs)")
                        .patientId(3L)
                        .patientName("Ibochouba Singh")
                        .district("Imphal West, Manipur")
                        .zaritBurdenScore(58)
                        .burdenCategory("HIGH_BURNOUT_RISK")
                        .weeklyNightWanderingAlerts(3)
                        .daysActiveThisMonth(29)
                        .respiteCareStatus("COMMUNITY_ASHA_DISPATCHED")
                        .build()
        );
    }

    public List<AdminKioskStationDTO> getRegionalKioskStationsNetwork() {
        return List.of(
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-DISPUR-01")
                        .stationName("Dispur Primary Health Center Station")
                        .locationDistrict("Kamrup Metropolitan")
                        .state("Assam")
                        .status("ONLINE")
                        .scansToday(14)
                        .lastPingAt(LocalDateTime.now().minusMinutes(2))
                        .build(),
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-MAJULI-02")
                        .stationName("Majuli Kamalabari Rural Wellness Kiosk")
                        .locationDistrict("Majuli")
                        .state("Assam")
                        .status("ONLINE")
                        .scansToday(8)
                        .lastPingAt(LocalDateTime.now().minusMinutes(5))
                        .build(),
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-SHILLONG-03")
                        .stationName("East Khasi Hills Civil Outreach Station")
                        .locationDistrict("East Khasi Hills")
                        .state("Meghalaya")
                        .status("IDLE")
                        .scansToday(6)
                        .lastPingAt(LocalDateTime.now().minusMinutes(12))
                        .build(),
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-AIZAWL-04")
                        .stationName("Aizawl Urban Health Center Station")
                        .locationDistrict("Aizawl")
                        .state("Mizoram")
                        .status("ONLINE")
                        .scansToday(11)
                        .lastPingAt(LocalDateTime.now().minusMinutes(1))
                        .build()
        );
    }
}
