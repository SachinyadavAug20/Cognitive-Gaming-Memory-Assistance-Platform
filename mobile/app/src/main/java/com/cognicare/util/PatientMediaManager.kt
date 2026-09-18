package com.cognicare.util

data class MemoryItem(
    val id: String,
    val name: String,
    val relation: String,
    val description: String,
    val imageAssetPath: String,
    val category: String,
    val emoji: String
)

object PatientMediaManager {

    fun getProfilePhoto(patientId: Long): String {
        return when (patientId) {
            1L -> "sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg"
            2L -> "sample-images/patient_2_mary_nongrum/patient_profile_photo_mary_nongrum.jpg"
            3L -> "sample-images/patient_3_ibochouba_singh/patient_profile_photo_ibochouba_singh.jpg"
            4L -> "sample-images/patient_4_lalhmingmawii_sailo/patient_profile_photo_lalhmingmawii_sailo.jpg"
            5L -> "sample-images/patient_5_kevichusa_angami/patient_profile_photo_kevichusa_angami.jpg"
            else -> "sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg"
        }
    }

    fun getMemoriesForPatient(patientId: Long): List<MemoryItem> {
        return when (patientId) {
            2L -> listOf(
                MemoryItem(
                    id = "2_r1",
                    name = "Daphisha Nongrum",
                    relation = "Daughter",
                    description = "Eldest daughter, school teacher in Shillong. Visits every evening after classes.",
                    imageAssetPath = "sample-images/patient_2_mary_nongrum/relatives/01_daughter_daphisha_nongrum.jpg",
                    category = "Family",
                    emoji = "👩‍🏫"
                ),
                MemoryItem(
                    id = "2_r2",
                    name = "Banker Nongrum",
                    relation = "Spouse",
                    description = "Beloved husband of 44 years. Enjoys listening to choir hymns and sharing tea in the veranda.",
                    imageAssetPath = "sample-images/patient_2_mary_nongrum/relatives/02_spouse_banker_nongrum.jpg",
                    category = "Family",
                    emoji = "👴"
                ),
                MemoryItem(
                    id = "2_r3",
                    name = "Banylla Nongrum",
                    relation = "Grandchild",
                    description = "9-year-old granddaughter. Loves drawing flowers and hearing stories about Cherrapunji.",
                    imageAssetPath = "sample-images/patient_2_mary_nongrum/relatives/03_grandchild_banylla_nongrum.jpg",
                    category = "Family",
                    emoji = "👧"
                ),
                MemoryItem(
                    id = "2_p1",
                    name = "Nongrim Hills Cottage",
                    relation = "Family Home",
                    description = "Warm wooden hillside cottage surrounded by pine trees and blooming hydrangeas.",
                    imageAssetPath = "sample-images/patient_2_mary_nongrum/places/01_home_nongrim_hills_cottage.jpg",
                    category = "Familiar Place",
                    emoji = "🏡"
                ),
                MemoryItem(
                    id = "2_p2",
                    name = "Laitumkhrah Main Market",
                    relation = "Morning Bazaar",
                    description = "Bustling Shillong bazaar where Mary shops for fresh mountain vegetables and local bakeries.",
                    imageAssetPath = "sample-images/patient_2_mary_nongrum/places/02_laitumkhrah_main_market.jpg",
                    category = "Familiar Place",
                    emoji = "🛒"
                ),
                MemoryItem(
                    id = "2_p3",
                    name = "Ward's Lake (Nan Polok)",
                    relation = "Favorite Park",
                    description = "Scenic horseshoe lake with charming wooden bridge where family strolls every weekend.",
                    imageAssetPath = "sample-images/patient_2_mary_nongrum/places/05_wards_lake_nan_polok.jpg",
                    category = "Familiar Place",
                    emoji = "🏞️"
                )
            )

            3L -> listOf(
                MemoryItem(
                    id = "3_r1",
                    name = "Sanatombi Devi",
                    relation = "Spouse",
                    description = "Married 48 years. Expert weaver of traditional Manipuri Phanek and loving partner.",
                    imageAssetPath = "sample-images/patient_3_ibochouba_singh/relatives/01_spouse_sanatombi_devi.jpg",
                    category = "Family",
                    emoji = "👵"
                ),
                MemoryItem(
                    id = "3_r2",
                    name = "Birjit Singh",
                    relation = "Son",
                    description = "Eldest son working in Imphal. Always helps around the courtyard garden on holidays.",
                    imageAssetPath = "sample-images/patient_3_ibochouba_singh/relatives/02_son_birjit_singh.jpg",
                    category = "Family",
                    emoji = "👨‍💼"
                ),
                MemoryItem(
                    id = "3_p1",
                    name = "Ema Keithel Market",
                    relation = "Historic Market",
                    description = "Centuries-old mother's market in Imphal where the family has traded for generations.",
                    imageAssetPath = "sample-images/patient_3_ibochouba_singh/places/02_ema_keithel_market.jpg",
                    category = "Familiar Place",
                    emoji = "🛍️"
                ),
                MemoryItem(
                    id = "3_p2",
                    name = "Shree Govindaji Temple",
                    relation = "Sacred Temple",
                    description = "Historic twin-domed golden temple where Ibochouba attends morning prayer bells.",
                    imageAssetPath = "sample-images/patient_3_ibochouba_singh/places/03_shree_govindaji_temple.jpg",
                    category = "Familiar Place",
                    emoji = "🛕"
                )
            )

            else -> listOf(
                // Patient 1 (Biren Borah) default
                MemoryItem(
                    id = "1_r1",
                    name = "Manash Borah",
                    relation = "Son",
                    description = "Eldest son, mechanical engineer in Guwahati. Visits every Sunday morning with fresh treats.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
                    category = "Family",
                    emoji = "👨‍💼"
                ),
                MemoryItem(
                    id = "1_r2",
                    name = "Pratima Borah",
                    relation = "Spouse",
                    description = "Married for 46 joyful years. Loves tending to terrace orchids and cooking traditional Khar together.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
                    category = "Family",
                    emoji = "👵"
                ),
                MemoryItem(
                    id = "1_r3",
                    name = "Ananya Borah",
                    relation = "Daughter",
                    description = "Youngest daughter, teacher at Cotton University. Calls faithfully every evening at 7:00 PM.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/relatives/03_daughter_ananya_borah.jpg",
                    category = "Family",
                    emoji = "👩‍🏫"
                ),
                MemoryItem(
                    id = "1_r4",
                    name = "Arnav Borah",
                    relation = "Grandchild",
                    description = "8-year-old grandson. Loves hearing bedtime folklore tales about Kaziranga rhinos and playing carrom.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/relatives/04_grandchild_arnav_borah.jpg",
                    category = "Family",
                    emoji = "👦"
                ),
                MemoryItem(
                    id = "1_r5",
                    name = "Dhireswar Borah",
                    relation = "Brother",
                    description = "Elder brother residing in Jorhat. Frequent weekly telephone chats discussing tea gardens and ancestral land.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/relatives/05_sibling_dhireswar_borah.jpg",
                    category = "Family",
                    emoji = "👴"
                ),
                MemoryItem(
                    id = "1_p1",
                    name = "Silpukhuri Family Home",
                    relation = "Ancestral Residence",
                    description = "Two-story Assam-type house surrounded by betel nut palms where Biren has lived since 1978.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
                    category = "Familiar Place",
                    emoji = "🏡"
                ),
                MemoryItem(
                    id = "1_p2",
                    name = "Silpukhuri Daily Bazaar",
                    relation = "Morning Market",
                    description = "Local bazaar where Biren buys fresh river fish and crisp organic greens every morning.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/places/02_silpukhuri_daily_market.jpg",
                    category = "Familiar Place",
                    emoji = "🐟"
                ),
                MemoryItem(
                    id = "1_p3",
                    name = "Hari Namghar Prayer Hall",
                    relation = "Sacred Namghar",
                    description = "Traditional Vaishnavite prayer hall for community hymns, Borgeet, and evening brass Doba chimes.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
                    category = "Familiar Place",
                    emoji = "🛕"
                ),
                MemoryItem(
                    id = "1_p4",
                    name = "Dighalipukhuri Lake Park",
                    relation = "Walking Park",
                    description = "Centuries-old lake surrounded by giant rain trees where Biren takes peaceful sunset strolls.",
                    imageAssetPath = "sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
                    category = "Familiar Place",
                    emoji = "🏞️"
                )
            )
        }
    }
}
